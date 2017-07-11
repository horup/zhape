import * as PolyK from 'polyk';
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
    constructor(sector)
    {
        this.sector = sector;
    }

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


    hasLoop(edges:Edge[], start, end)
    {
        if (start < edges.length && end < edges.length)
        {
            let e1 = edges[start];
            let e2 = edges[end];

            if (e1.start == e2.start)
                return true;
            else if (e1.start == e2.end)
                return true;
        }
        return false;
    }

    getPolygons(sector:number)
    {
        let edges = this.edges.filter((e)=>((e.left != null && e.left.sector == sector) || (e.right != null && e.right.sector == sector)));
        let start = 0;
        let end = 1;
        let polygons:number[][] = [];
        while (end < this.edges.length)
        {
            if (this.hasLoop(edges, start, end))
            {
                let indicies:number[] = [];
                for (let i = start; i <= end; i++)
                {
                    let vs = [edges[i].start, edges[i].end];
                    for (let v of vs)
                    {
                        if (indicies.indexOf(v) == -1)
                        {
                            indicies.push(v);
                        }
                    }
                }

                polygons.push(indicies);

                start = end;
            }

            end++;
        }

        return polygons;



      /*  let indicies:number[] = [];
        for (let edge of this.edges)
        {
            if ((edge.left != null && edge.left.sector == sector) || (edge.right != null && edge.right.sector == sector))
            {
                let vs = [edge.start, edge.end];
                for (let v of vs)
                {
                    if (indicies.indexOf(v) == -1)
                    {
                        indicies.push(v);
                    }
                }
            }
        }

        return indicies;*/
    }

    isInsideSector(x:number, y:number, sector:number)
    {
        let indicies = this.getPolygons(sector)[0];
        console.log(JSON.stringify(indicies));
        let vertices:number[] = [];
        for (let index of indicies)
        {
            vertices.push(this.vertices[index].x);
            vertices.push(this.vertices[index].y);
        }

        return PolyK.ContainsPoint(vertices, x, y);
    }

    isEdgeInsideSector(edge:Edge, sector:number)
    {
        let midX = (this.vertices[edge.start].x + this.vertices[edge.end].x) / 2;
        let midY = (this.vertices[edge.start].y + this.vertices[edge.end].y) / 2;
        console.log(midX + "," + midY);
        return this.isInsideSector(midX, midY, sector);
    }
    
    insertEdges(indicies:number[])
    {
        let sector = new Sector();
        let sectorIndex = this.sectors.length;
        this.sectors.push(sector);

        for (let i = 0; i < indicies.length; i++)
        {
            let s = indicies[i];
            let e = indicies[(i+1)%indicies.length];
            let edge = new Edge(s, e);
            let clockwise = this.isClockwise(indicies);
            let side = new Side(sectorIndex);
            if (clockwise)
                edge.right = side;
            else
                edge.left = side;

            let index = this.edges.findIndex((e)=>e.equals(edge));
            if (index == -1)
            {
                for (let i = 0; i < this.sectors.length; i++)
                {
                    if (i != sectorIndex && this.isEdgeInsideSector(edge, i))
                    {
                        console.log(i);
                        if (edge.right == null)
                            edge.right = new Side(i);
                        else
                            edge.left = new Side(i);
                    }
                }

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