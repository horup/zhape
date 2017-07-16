import * as Model from '../../model';
import Draw from './draw';
enum State
{
    Pointer,
    Selection,
    Move
}


export default class Renderer
{
    draw = new Draw(this);
    input = 
    {
        leftdown:false,
        rightdown:false,
        mouseX:0,
        mouseY:0,
        undo:false,
        redo:false,
        ins:false,
        split:false,
        camera:false,
        zoom:0,
        save:false,
        load:false,
        grid:false
    }

    editing =
    {
        state : State  .Pointer,
        
        mouseX:0,
        mouseY:0,
        gridSize:64,
        selectedVerticies:[] as Number[]
    }

    map:Model.Map = new Model.Map();
    history = [] as Model.Map[];
    context:CanvasRenderingContext2D;

    workingSet:Model.Vertex[] = [];
    edges:{x:number, y:number}[][] = [];
    

    constructor(context:CanvasRenderingContext2D)
    {
        this.context = context;
    }

    snappedX()
    {
        let x = this.draw.wrlX(this.input.mouseX) + this.draw.gridSize/2;
        x = Math.floor(x / this.draw.gridSize) * this.draw.gridSize;
        return x;
    }
     
    snappedY()
    {
        let y = this.draw.wrlY(this.input.mouseY) + this.draw.gridSize/2;
        y = Math.floor(y / this.draw.gridSize) * this.draw.gridSize;
        return y;
    }

    drawSelection()
    {
        if (this.editing.state == State.Selection)
        {
            let c = this.context;
            c.strokeStyle = 'white';
            let w = this.input.mouseX - this.editing.mouseX;
            let h = this.input.mouseY - this.editing.mouseY;
            c.strokeRect(this.editing.mouseX + 0.5, this.editing.mouseY + 0.5, w, h)
        }
    }

    select()
    {
        let polygon = [this.input.mouseX, this.input.mouseY, 
                       this.input.mouseX, this.editing.mouseY,
                       this.editing.mouseX, this.editing.mouseY, 
                       this.editing.mouseX, this.input.mouseY];

        for (let i = 0; i < this.map.vertices.length; i++)
        {
            if (this.map.isInsidePolygon(this.map.vertices[i].x, this.map.vertices[i].y, polygon))
            {
                this.editing.selectedVerticies.push(i);
            }
        }
    }

    insertVertex()
    {
        let x = this.snappedX();
        let y = this.snappedY();
        let insert = false;
        if (this.workingSet.length >= 2 &&
            this.workingSet[0].x == x && this.workingSet[0].y == y)
        {
            insert = true;
        }

        if (this.workingSet.filter((p)=>p.x == x && p.y == y).length == 0)
            this.workingSet.push(new Model.Vertex(x, y));
            
        if (insert)
        {
            this.history.push(Model.Map.clone(this.map));
            let indicies = this.map.insertVertices(this.workingSet);
            this.map.insertEdges(indicies);
            this.workingSet = [];
        }
    }



    animate()
    {
        let c = this.context;
        this.draw.width = c.canvas.width;
        this.draw.height = c.canvas.height;

        if (this.input.undo)
        {
            this.input.undo = false;
            if (this.history.length > 0)
            {
                let map = this.history[this.history.length - 1];
                this.history.splice(this.history.length -1, 1);
                this.map = map;
            }
        }

        if (this.input.zoom != 0)
        {
            let mx = this.draw.wrlX(this.input.mouseX);// - this.wrlX(this.width / 2);
            let my = this.draw.wrlY(this.input.mouseY);// - this.wrlY(this.height / 2);

            let diff = this.draw.zoom;
            if (this.input.zoom < 0)
                this.draw.zoom *= 2;
            else
                this.draw.zoom /= 2;
            diff = diff - this.draw.zoom;

            let vx = this.input.mouseX - this.draw.scrX(mx);
            let vy = this.input.mouseY - this.draw.scrY(my);
            this.draw.scrollX += vx;
            this.draw.scrollY += vy;
            this.input.zoom = 0;
        }
        if (this.input.rightdown)
        {
            if (this.editing.state != State.Move)
            {
                this.editing.mouseX = this.input.mouseX;
                this.editing.mouseY = this.input.mouseY;
                this.editing.state = State.Move;
            }
            else
            {
                let mx = this.editing.mouseX - this.input.mouseX;
                let my = this.editing.mouseY - this.input.mouseY;
                this.draw.scrollX -= mx;
                this.draw.scrollY -= my
                this.editing.mouseX = this.input.mouseX;
                this.editing.mouseY = this.input.mouseY;
            }
        }
        else if (this.editing.state == State.Move)
        {
            this.editing.state = State.Pointer;
        }

        if (this.input.grid)
        {
            this.input.grid = false;
            this.draw.gridSize/=2;
            if (this.draw.gridSize < 8)
            {
                this.draw.gridSize = 64;
            }
        }
        if (this.input.save)
        {
            this.input.save = false;
            if (this.map.edges.length > 0)
            {
                localStorage.setItem('quick', JSON.stringify(this.map));
            }
        }
        else if (this.input.load)
        {
            this.input.load = false;
            let map = JSON.parse(localStorage.getItem('quick')) as Model.Map;
            Object.setPrototypeOf(map, Model.Map.prototype);
            for (let obj of map.edges)
            {
                Object.setPrototypeOf(obj, Model.Edge.prototype);
                if (obj.left != null) Object.setPrototypeOf(obj.left, Model.Side.prototype);
                if (obj.right != null) Object.setPrototypeOf(obj.right, Model.Side.prototype);
            }
            for (let obj of map.vertices)
                Object.setPrototypeOf(obj, Model.Vertex.prototype);
            for (let obj of map.sectors)
                Object.setPrototypeOf(obj, Model.Sector);
            
            this.map = map;
        }
        if (this.editing.state == State.Pointer || this.editing.state == State.Selection)
        {
            if (this.input.leftdown)
            {
                if (this.editing.state == State.Pointer)
                {
                    this.editing.selectedVerticies = [];
                    this.editing.state = State.Selection;
                    this.editing.mouseX = this.input.mouseX;
                    this.editing.mouseY = this.input.mouseY;
                }
            }
            else if (!this.input.leftdown)
            {
                if (this.editing.state == State.Selection)
                {
                    this.editing.state = State.Pointer;
                    this.select();
                }
            }
        }

        if (this.editing.state == State.Pointer)
        {
            if (this.input.ins)
            {
                this.input.ins = false;
                this.insertVertex();
            }
        }


        c.clearRect(0,0,this.draw.width, this.draw.height);
        this.draw.drawGrid();
        this.draw.drawEdges();
        this.draw.drawVertices();
        this.draw.drawWorkingSet();
        this.draw.drawSnap();
        requestAnimationFrame(()=>this.animate());
    }
}