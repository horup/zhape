export class Vertex
{
    x:number;
    y:number;
    set(x:number, y:number)
    {
        this.x = x;
        this.y = y;
    }

    equals(v:Vertex)
    {
        if (v.x == this.x && v.y == this.y)
            return true;
        return false;
    }
}

export class Side
{
    texture:any;
    sector:Sector;
}

export class Sector
{
    id:number = 0;
    ceiling:number = 128;
    floor: number = 0;
    texture:any;
}

export class Edge
{
    start:Vertex = new Vertex();
    end:Vertex = new Vertex();
    right?:Side;
    left?:Side;
    equals(edge:Edge)
    {
        if ((this.start.equals(edge.start) && this.end.equals(edge.end)) ||
            (this.start.equals(edge.end) && this.end.equals(edge.start)))
            return true;
        return false;
    }
}

export class Map
{
    edges:Edge[] = [];
    sides:Side[] = [];
    sector:Sector[] = [];
}

export function isClockwise(edges:Edge[])
{
    let sum = 0;
    for (let edge of edges)
    {
        sum += (edge.start.x * edge.end.y - edge.end.x * edge.start.y);
    }

    console.log(sum);

    return sum < 0;
}