
import * as Model from '../../model';
enum State
{
    Pointer,
    Selection,
    Move
}


export default class Renderer
{
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
        scroll:false,
        save:false,
        load:false,
        grid:false
    }

    editing =
    {
        state : State.Pointer,
        scrollX:0,
        scrollY:0,
        zoom:0,
        mouseX:0,
        mouseY:0,
        gridSize:64,
        selectedVerticies:[] as Number[]
    }

    map:Model.Map = new Model.Map();
    width:number;
    height:number;
    context:CanvasRenderingContext2D;
    gridSize = 64;

    workingSet:Model.Vertex[] = [];
    edges:{x:number, y:number}[][] = [];
    

    constructor(context:CanvasRenderingContext2D)
    {
        this.context = context;
    }

    scrX(x:number)
    {
        x += this.editing.scrollX;
        return x;
    }

    scrY(y:number)
    {
        y += this.editing.scrollY;
        return y;
    }
    

    snappedX()
    {
        let x = this.input.mouseX + this.gridSize/2;
        x = Math.floor(x / this.gridSize) * this.gridSize;
        return x;
    }

    snappedY()
    {
        let y = this.input.mouseY + this.gridSize/2;
        y = Math.floor(y / this.gridSize) * this.gridSize;
        return y;
    }

    drawGrid()
    {
        return;
        let offx = 0;
        let offy = 0;
        let c = this.context;
        c.strokeStyle ="#505050";
        c.lineWidth = 1;
        for (let y = 0; y < this.height;y+=this.gridSize)
        {
            c.beginPath();
            c.moveTo(0, y+0.5);
            c.lineTo(this.width+0.5, y+0.5);
            c.stroke();
        }
        for (let x = 0; x < this.width;x+=this.gridSize)
        {
            c.beginPath();
            c.moveTo(x+0.5, 0);
            c.lineTo(x+0.5, this.height);
            c.stroke();
        }
    }

    drawSnap()
    {
        let c = this.context;
        c.strokeStyle = 'white';
        let x = this.snappedX() + 0.5;
        let y = this.snappedY() + 0.5;
        let s = 6;
        c.strokeRect(x - s/2,y - s/2,s,s);
    }

    drawWorkingSet()
    {
        let c = this.context;
        c.strokeStyle = 'green';
        c.beginPath();
        for (let p of this.workingSet)
        {
            c.lineTo(p.x + 0.5, p.y + 0.5);
        }

        let x = this.snappedX();
        let y = this.snappedY();
        c.lineTo(x + 0.5, y + 0.5);
        
        c.stroke();
    }

    drawVertices()
    {
        let c = this.context;

        let s = 3;
        let i = 0;
        for (let v of this.map.vertices)
        {
            if (this.editing.selectedVerticies.indexOf(i) != -1)
                c.strokeStyle = 'red';
            else
                c.strokeStyle = 'white';
            c.strokeRect(this.scrX(v.x) + 0.5 - s, this.scrY(v.y) + 0.5 - s, s*2, s*2);
            i++;
        }
    }

    drawEdges()
    {
        let c = this.context;
        c.fillStyle = 'white';
        for (let edge of this.map.edges)
        {
            let s = this.map.vertices[edge.start];
            let e = this.map.vertices[edge.end];
            if (edge.left != null && edge.right != null)
            {
                c.strokeStyle = 'red';
            }
            else
            {
                c.strokeStyle = 'white';
            }
            
            let midX = this.scrX((this.map.vertices[edge.start].x + this.map.vertices[edge.end].x) / 2);
            let midY = this.scrY((this.map.vertices[edge.start].y + this.map.vertices[edge.end].y) / 2);
            
            let vx = (e.x - s.x);
            let vy = (e.y - s.y);
            let l = Math.sqrt(vx * vx + vy * vy);
            if (l != 0)
            {
                vx /= l;
                vy /= l;
            }
            
            c.beginPath();
            c.moveTo(this.scrX(s.x) + 0.5, this.scrY(s.y) + 0.5);
            let nl = 8;
            if (edge.left != null)
            {
                c.fillText(""+edge.left.sector, midX + -vy * nl + 0.5, midY + vx * nl + 0.5);
            }
            if (edge.right != null)
            {
                c.fillText(""+edge.right.sector, midX + -vy * -nl + 0.5, midY + vx * -nl + 0.5);
            }
            c.lineTo(this.scrX(e.x) + 0.5, this.scrY(e.y) + 0.5);
            c.stroke();
        }
    }

    drawSectors()
    {
        for (let sector = 0; sector < this.map.sectors.length; sector++)
        {
          //  if (this.map.isInsideSector(this.mouseX, this.mouseY, sector))
            //    console.log(sector);
        }
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
            let indicies = this.map.insertVertices(this.workingSet);
            this.map.insertEdges(indicies);
            this.workingSet = [];
        }
    }



    animate()
    {
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
                this.editing.scrollX -= mx;
                this.editing.scrollY -= my
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
            this.gridSize/=2;
            if (this.gridSize < 8)
            {
                this.gridSize = 64;
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

        let c = this.context;
        this.width = c.canvas.width;
        this.height = c.canvas.height;
        c.clearRect(0,0,this.width, this.height);
        this.drawGrid();
        this.drawSnap();
        this.drawSectors();
        this.drawEdges();
        this.drawVertices();
        this.drawWorkingSet();
        this.drawSelection();
        requestAnimationFrame(()=>this.animate());
    }
}