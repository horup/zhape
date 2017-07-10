export class Vertex
{
    x:number;
    y:number;
    constructor(x:number = 0, y:number = 0)
    {
        this.x = x;
        this.y = y;
    }

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

    toArray()
    {
        return [this.x, this.y];
    }
}

export class Edge
{
    start:number;
    end:number;
    right?:Side;
    left?:Side;
    constructor(start:number, end:number)
    {
        this.start = start;
        this.end = end;
    }
    equals(edge:Edge)
    {
        if (this.start == edge.start && this.end == edge.end)
            return true;
        else if (this.start == edge.end && this.end == edge.start)
            return true;
        return false;
    }

    flipped(edge:Edge)
    {
         if (this.start == edge.start && this.end == edge.end)
            return false;
        else if (this.start == edge.end && this.end == edge.start)
            return true;
        return undefined;
    }
}

export class Side
{
    texture:any;
    sector:number;
}

export class Sector
{
    ceiling:number = 128;
    floor: number = 0;
    texture:any;
}


export class Map
{
    vertices:Vertex[] = [];
    edges:Edge[] = [];
    sides:Side[] = [];
    sectors:Sector[] = [];

    isClockwise(indicies:number[])
    {
        let sum = 0;
        for (let i = 0; i < indicies.length; i++)
        {
            let s = this.vertices[indicies[(i) % indicies.length]];
            let e = this.vertices[indicies[(i+1) % indicies.length]];
            sum += (s.x * e.y - e.x * s.y);
        }

        return sum < 0;
    }

    insertVertices(vs:Vertex[])
    {
        let indicies :number[] = [];

        for (let i = 0; i < vs.length; i++)
        {
            let index = this.vertices.findIndex((v) => v.equals(vs[i]));
            if (index == -1)
            {
                indicies.push(this.vertices.length);
                this.vertices.push(vs[i]);
            }
            else
            {
                vs[i] = this.vertices[index];
                indicies.push(index);
            }
        }

        return indicies;
    }
    
    insertEdges(indicies:number[])
    {
        for (let i = 0; i < indicies.length; i++)
        {
            let s = indicies[i];
            let e = indicies[(i+1)%indicies.length];
            let edge = new Edge(s, e);
            let clockwise = this.isClockwise(indicies);
            let side = new Side();
            if (clockwise)
                edge.right = side;
            else
                edge.left = side;

            let index = this.edges.findIndex((e)=>e.equals(edge));
            if (index == -1)
            {
                this.edges.push(edge);
            }
            else
            {
                let existing = this.edges[index];
                let flipped = existing.flipped(edge);
                if (clockwise)
                {
                    if (!flipped)
                        existing.right = side;
                    else
                        existing.left = side;
                }
                else
                {
                    if (!flipped)
                        existing.left = side;
                    else
                        existing.right = side;
                }
            }
        }
    }
}