# Maximum degree 
The degree of a vertex of a graph is the number of edges that are incident to the vertex. The degree of a vertex $v$ is denoted $d(v)$. The maximum degree of a graph, denoted by $\Delta(G)$ is the  maximum of its vertices' degrees.

**This parameter is computed live.**

## Input/Output
- Input: A graph or an area $G$ 
- Output: The value of $\Delta(G)$ 

## Pseudo Code

```

procedure min_degree(G: Graph)
    if |V(G)| = 0 then
        return 0
    end if 

    D ← degree of an arbitrary vertex of G
    for each vertex u in V(G) do
        if D < d(u) then
            D ← d(u)
        end if 
    end for
    return D
end procedure


```

## Complexity
This implementation of the algorithm runs in $O(n)$, where $n$ stands for the number of vertices of the graph.  

## Example
TO DO
 
## Comments

## More information
  - [Degrees on Wikipedia](https://en.wikipedia.org/wiki/Degree_(graph_theory)) 

## Changes

  - **v1** Initial implementation of the algorithm 