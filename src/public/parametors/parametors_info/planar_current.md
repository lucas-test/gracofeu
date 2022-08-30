# Is the graph currently planar?
We say that a graph is planar if it can be drawn on the plane in such a way that its edges intersect only at their endpoints. In other words, it can be drawn in such a way that no edges cross each other.[

**This parameter is computed live.**

## Input/Output
- Input: An undirected graph or an area $G$
- Output: True if and only if the current drawing of the graph is planar. 


## Pseudo Code

```

procedure planar_current(G: Graph): boolean
    for all edges e of E(G) do
        for all edges e' of E(G) do
            if e != e' and there is an intersection between e and e' then
                return false
            end if
        end for
    end for
    return true
end procedure


```

## Complexity
This implementation of the algorithm runs in $O(m^2)$, where $m$ stands for the number of edges of the graph.

## Example
TO DO
 
## Comments

This algorithm takes in consideration whether an edge is bent or not. 

## More information
  - [Edge on Wikipedia](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#edge) 
  - [Planar graph on Wikipedia](https://en.wikipedia.org/wiki/Planar_graph)

## Changes

  - **v1** Initial implementation of the algorithm 