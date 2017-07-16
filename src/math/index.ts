function traverse(start:number, visited:{[id:number]:number})
{
    let max = Object.keys(visited).length;
    let path = [] as number[];
    let current = start;
    do
    {
        if (max == 0)
            return null;
        path.push(current);
        current = visited[current];
        max--;
    } while (current != start)

    return path;
}

export function findLoop(edges:[number, number][])
{
    if (edges.length == 0)
        return null;

    let visited:{[id:number]:number} = {};
    let queue = [] as number[];

    let start = edges[0][0];
    visited[start] = start;
    queue.push(start);
    let vertices = [] as number[];
    let prev = start;
    while (queue.length > 0)
    {
        let temp = queue.shift();
        for (let i = 0 ; i < edges.length; i++)
        {
            let edge = edges[i];            
            for (let j = 0; j <= 1; j++)
            {
                let v1 = edge[j];
                if (v1 == temp)
                {
                    let v2 = edge[(j+1)%2];
                    if (visited[v2] != v1 && visited[v1] != v2)
                    {
                        visited[v2] = v1;
                        if (v2 == start)
                        {
                            return traverse(start, visited);
                        }
                        else
                        {
                            queue.push(v2);
                        }
                    }
                }
            }
        }

        prev = temp;
    }

    return null;
}