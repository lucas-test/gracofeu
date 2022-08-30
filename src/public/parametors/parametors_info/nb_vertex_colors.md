# Number of different colors for the vertices 
This algorithm returns the number of colors used on the vertices of a graph or an area.

**This parameter is computed live.**

## Input/Output
- Input: A graph or an area $G$ 
- Output: The number of colors for the vertices of $G$

## Pseudo Code

```

procedure nb_vertex_colors(G: Graph)
    colors ← new Set()
    for each vertex u in V(G) do
        colors.add(u.color)
    end for
    return colors.size
end procedure


```

## Complexity
This implementation of the algorithm runs in $O(n)$, where $n$ stands for the number of vertices of the graph.  

## Example
TO DO
 
## Comments

## More information
  - [Colors on Wikipedia](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#color) 

## Changes

  - **v1** Initial implementation of the algorithm 