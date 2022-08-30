# Average degree 
The degree of a vertex of a graph is the number of edges that are incident to the vertex. The degree of a vertex $v$ is denoted $d(v)$. The average degree of a graph is the average value of its vertices' degrees.

**This parameter is computed live.**

## Input/Output
- Input: A graph or an area $G$ 
- Output: The average value of the degrees of $G$

## Pseudo Code

```

procedure min_degree(G: Graph)
    s ← 0
    for each vertex u in V(G) do
        s ← s + d(u)
    end for
    return s/|V(G)| (rounded to two decimal places)
end procedure


```

## Complexity
This implementation of the algorithm runs in $O(n)$, where $n$ stands for the number of vertices of the graph.  

## Example
TO DO
 
## Comments
The result returned is rounded to two decimal places. 

If the graph is loopless, it is possible to compute the value of the graph in constant time using the formula $\sum_{v \in V(G)} d(v) = 2 |E(G)|$. 


## More information
  - [Degrees on Wikipedia](https://en.wikipedia.org/wiki/Degree_(graph_theory)) 

## Changes

  - **v1** Initial implementation of the algorithm 