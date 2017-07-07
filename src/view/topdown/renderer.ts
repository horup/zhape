export default class Renderer
{
    width:number;
    height:number;
    context:CanvasRenderingContext2D;
    constructor(context:CanvasRenderingContext2D)
    {
        this.context = context;
    }

    drawGrid()
    {
        let offx = 0;
        let offy = 0;
        let c = this.context;
        c.strokeStyle ="#505050";
        c.lineWidth = 1;
        let spacing = 64;
        for (let y = 0; y < this.height;y+=spacing)
        {
            c.beginPath();
            c.moveTo(0, y+0.5);
            c.lineTo(this.width+0.5, y+0.5);
            c.stroke();
        }
        for (let x = 0; x < this.height;x+=spacing)
        {
            c.beginPath();
            c.moveTo(x+0.5, 0);
            c.lineTo(x+0.5, this.height);
            c.stroke();
        }
    }

    animate()
    {
        let c = this.context;
        this.width = c.canvas.width;
        this.height = c.canvas.height;
        c.clearRect(0,0,this.width, this.height);
        this.drawGrid();
        requestAnimationFrame(()=>this.animate());
    }
}