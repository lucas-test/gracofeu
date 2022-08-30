# Is the current vertex coloring proper ? 
A proper vertex coloring is labeling of the graph's vertices with colors such that no two vertices sharing the same edge have the same color.

This algorithms check wether the current colors used form a proper vertex coloring or not

**This parameter is computed live.**

## Input/Output
- Input: A graph or an area $G$ 
- Output: True if and only if the vertices are properly colored

## Pseudo Code

```

procedure has_proper_coloring(G: Graph):boolean
    if |V(G)| = 0 then
        return true
    end if 

    visited ← new Map()
    for each vertex u in V(G) do
        visited(u) ← false
    end for
    v ← arbitrary vertex of G

    S ← new Stack()
    S.push(v)

    while S not empty do
        v ← S.pop()
        if not visited(v)
            for each vertex u adjacent to v do
                if color(u)=color(v) then
                    return false
                end if 
                S.push(u)
            end for
        end if
    end while

    return true
end procedure


```

## Complexity
This implementation of the algorithm runs in $O(n+m)$, where $n$ (resp. $m$) stands for the number of vertices (resp. edges) of the graph.  

## Example
TO DO
 
## Comments

## More information
  - [Colors on Wikipedia](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#color) 

  - [Graph coloring on Wikipedia](https://en.wikipedia.org/wiki/Graph_coloring) 
  

## Changes

  - **v1** Initial implementation of the algorithm 