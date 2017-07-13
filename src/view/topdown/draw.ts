import * as Model from '../../model';
import Renderer from './renderer';
export default class Draw
{
    renderer:Renderer;
    scrollX = 0;
    scrollY = 0;
    width = 0;
    height = 0;
    zoom = 1;
    gridSize = 64;

    constructor(renderer:Renderer)
    {
        this.renderer = renderer;
    }

    scrX(x:number)
    {
        x *= this.zoom;
        x += this.scrollX;
        return x;
    }

    wrlX(x:number)
    {
        x -= this.scrollX;        
        x /= this.zoom;
        return x;
    }

    scrY(y:number)
    {
        y *= this.zoom;
        y += this.scrollY;
        return y;
    }

    wrlY(y:number)
    {
        y -= this.scrollY;        
        y /= this.zoom;
        return y;
    }

    drawVertices()
    {
        let c = this.renderer.context;
        let map = this.renderer.map;

        let s = 3;
        let i = 0;
        for (let v of map.vertices)
        {
            if (this.renderer.editing.selectedVerticies.indexOf(i) != -1)
                c.strokeStyle = 'red';
            else
                c.strokeStyle = 'white';
            c.strokeRect(this.scrX(v.x) + 0.5 - s, this.scrY(v.y) + 0.5 - s, s*2, s*2);
            i++;
        }
    }

    drawEdges()
    {
        let c = this.renderer.context;
        let map = this.renderer.map;
        c.fillStyle = 'white';
        for (let edge of map.edges)
        {
            let s = map.vertices[edge.start];
            let e = map.vertices[edge.end];
            if (edge.left != null && edge.right != null)
            {
                c.strokeStyle = 'red';
            }
            else
            {
                c.strokeStyle = 'white';
            }
            
            let midX = this.scrX((map.vertices[edge.start].x + map.vertices[edge.end].x) / 2);
            let midY = this.scrY((map.vertices[edge.start].y + map.vertices[edge.end].y) / 2);
            
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

    zoomedGridSize()
    {
        return this.gridSize * this.zoom;
    }
    
    drawGrid()
    {
        let c = this.renderer.context;
        let offx = 0;
        let offy = 0;
        c.strokeStyle ="#505050";
        c.lineWidth = 1;
        let zoomedGridSize = this.zoomedGridSize();
        if (zoomedGridSize > 4)
        {
            for (let y = this.scrollY % zoomedGridSize; y < this.height;y+=zoomedGridSize)
            {
                c.beginPath();
                c.moveTo(0, y+0.5);
                c.lineTo(this.width+0.5, y+0.5);
                c.stroke();
            }
            for (let x = this.scrollX % zoomedGridSize; x < this.width;x+=zoomedGridSize)
            {
                c.beginPath();
                c.moveTo(x+0.5, 0);
                c.lineTo(x+0.5, this.height);
                c.stroke();
            }
        }
    }
    

    
    drawSnap()
    {
        let c = this.renderer.context;
        c.strokeStyle = 'white';
        let x = this.scrX(this.renderer.snappedX()) + 0.5;
        let y = this.scrY(this.renderer.snappedY()) + 0.5;
        let s = 6;
        c.strokeRect(x - s/2,y - s/2,s,s);
    }

}