
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

    workingSet:Model.Vertex[] = [];
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

    drawVertices()
    {
        let c = this.context;
        c.strokeStyle = 'white';
        let s = 3;
        for (let v of this.map.vertices)
        {
            c.strokeRect(v.x + 0.5 - s, v.y + 0.5 - s, s*2, s*2);
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

            let midX = (this.map.vertices[edge.start].x + this.map.vertices[edge.end].x) / 2;
            let midY = (this.map.vertices[edge.start].y + this.map.vertices[edge.end].y) / 2;
            
            let vx = (e.x - s.x);
            let vy = (e.y - s.y);
            let l = Math.sqrt(vx * vx + vy * vy);
            if (l != 0)
            {
                vx /= l;
                vy /= l;
            }
            
            c.beginPath();
            c.moveTo(s.x + 0.5, s.y + 0.5);
            let nl = 8;
            if (edge.left != null)
            {
                c.fillText(""+edge.left.sector, midX + -vy * nl + 0.5, midY + vx * nl + 0.5);
            }
            if (edge.right != null)
            {
                c.fillText(""+edge.right.sector, midX + -vy * -nl + 0.5, midY + vx * -nl + 0.5);
            }
            c.lineTo(e.x + 0.5, e.y + 0.5);
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
        this.drawSectors();
        this.drawEdges();
        this.drawVertices();
        this.drawWorkingSet();
        requestAnimationFrame(()=>this.animate());
    }
}