export default class Renderer
{
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
        c.strokeStyle = 'white';
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
        for (let edge of this.edges)
        {
            let c = this.context;
            c.strokeStyle = 'white';
            c.beginPath();
            for (let p of edge)
            {
                c.lineTo(p.x + 0.5, p.y + 0.5);
            }

            c.stroke();
        }
    }

    onClick()
    {
        let x = this.snappedX();
        let y = this.snappedY();
        let insert = false;
        if (this.workingSet.filter((v)=>v.x == x && v.y == v.y).length > 0)
        {
            insert = true;
        }
        this.workingSet.push({x:x, y:y});
       
        if (insert)
        {
            this.edges.push(this.workingSet);
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