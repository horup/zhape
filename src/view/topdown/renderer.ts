
import * as Model from '../../model';
export default class Renderer
{
    map:Model.Map = new Model.Map();
    click:boolean = false;
    mouseX = 0;
    mouseY = 0;
    width:number;
    height:number;
    context:CanvasRenderingContext2D;
    gridSize = 64;

    workingSet:{x:number, y:number}[] = [];
    edges:{x:number, y:number}[][] = [];
    

    constructor(context:CanvasRenderingContext2D)
    {
        this.context = context;
    }

    snappedX()
    {
        let x = this.mouseX + this.gridSize/2;
        x = Math.floor(x / this.gridSize) * this.gridSize;
        return x;
    }

    snappedY()
    {
        let y = this.mouseY + this.gridSize/2;
        y = Math.floor(y / this.gridSize) * this.gridSize;
        return y;
    }

    drawGrid()
    {
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
        for (let x = 0; x < this.height;x+=this.gridSize)
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

    drawEdges()
    {
        for (let edge of this.map.edges)
        {
            let c = this.context;
            if (edge.left != null && edge.right != null)
            {
                c.strokeStyle = 'red';
            }
            else
            {
                c.strokeStyle = 'white';
            }
            let vx = (edge.end.x - edge.start.x);
            let vy = (edge.end.y - edge.start.y);
            let l = Math.sqrt(vx * vx + vy * vy);
            if (l != 0)
            {
                vx /= l;
                vy /= l;
            }
            
            c.beginPath();
            c.moveTo(edge.start.x + 0.5, edge.start.y + 0.5);
            let nl = 16;
            if (edge.left != null)
            {
                c.moveTo(edge.start.x + vx * l/2 + 0.5, edge.start.y + vy * l/2 + 0.5);
                c.lineTo(edge.start.x + vx * l/2 + -vy * nl + 0.5, 
                         edge.start.y + vy * l/2 + vx * nl + 0.5);
                c.moveTo(edge.start.x + 0.5, edge.start.y + 0.5);
            }
            if (edge.right != null)
            {
                c.moveTo(edge.start.x + vx * l/2 + 0.5, edge.start.y + vy * l/2 + 0.5);
                c.lineTo(edge.start.x + vx * l/2 + -vy * -nl + 0.5, 
                         edge.start.y + vy * l/2 + vx * -nl + 0.5);
                c.moveTo(edge.start.x + 0.5, edge.start.y + 0.5);
            }
            c.lineTo(edge.end.x + 0.5, edge.end.y + 0.5);

            c.stroke();
        }
    }

    onClick()
    {
        let x = this.snappedX();
        let y = this.snappedY();
        let insert = false;
        if (this.workingSet.length >= 2 &&
            this.workingSet[0].x == x && this.workingSet[0].y == y)
        {
            insert = true;
        }

        if (this.workingSet.filter((p)=>p.x == x && p.y == y).length == 0 || insert)
            this.workingSet.push({x:x, y:y});
    
        if (insert)
        {
            //this.edges.push(this.workingSet);
            let edges:Model.Edge[] = [];
            for (let i = 0; i < this.workingSet.length; i++)
            {
                let edge = new Model.Edge();
                let p1 = this.workingSet[i];
                let p2 = this.workingSet[(i+1) % this.workingSet.length];
                edge.start.set(p1.x, p1.y);
                edge.end.set(p2.x, p2.y);
                edges.push(edge);
             /*   let duplicates = this.map.edges.filter((e)=>e.equals(edge));
                if (duplicates.length == 0)
                {
                    this.map.edges.push(edge);
                }
                else
                {
                    edge = duplicates[0];
                    edge.right = new Model.Side();
                }*/
            }

            let clockwise = Model.isClockwise(edges);
            for (let edge of edges)
            {
                let side = new Model.Side();
                if (clockwise)
                    edge.right = side;
                else
                    edge.left = side;
                let duplicates = this.map.edges.filter((e)=>e.equals(edge));
                if (duplicates.length == 0)
                {
                    this.map.edges.push(edge);
                }
                else
                {
                    edge = duplicates[0];
                    if (edge.left != null)
                    {
                        edge.right = side;
                    }
                    else if (edge.right != null)
                    {
                        edge.left = side;
                    }
                }
            }

            this.workingSet = [];
        }
    }

    animate()
    {
        if (this.click)
        {
            this.click = false;
            this.onClick();
        }

        let c = this.context;
        this.width = c.canvas.width;
        this.height = c.canvas.height;
        c.clearRect(0,0,this.width, this.height);
        this.drawGrid();
        this.drawSnap();
        this.drawWorkingSet();
        this.drawEdges();
        requestAnimationFrame(()=>this.animate());
    }
}