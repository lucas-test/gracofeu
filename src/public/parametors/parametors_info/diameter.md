# Diameter (undirected)
This algorithm computes the diameter of an undirected graph $G$, that is the *greatest distance between any pair of vertices* or, alternatively:

$$d(G) = max_{v\in V(G)} max_{u\in V(G)} d(u,v)$$

To compute the diameter, we use the **Floyd Warshall** algorithm (see pseudo-code below).  

**This parameter is not computed live.**

## Input/Output
- Input: An undirected graph $G$ 
- Output: A number. Returns ∞ if $G$ is not connected.

## Pseudo Code

```
procedure Diameter(G: Graph): number

    let dist be a |V(G)| × |V(G)| array of minimum distances initialized to ∞ (infinity)

    for each edge (u, v) in A(G) do
        dist[u][v] ← w(u, v)  // The weight of the edge (u, v)
    for each vertex v in V(G) do
        dist[v][v] ← 0

    for each vertex k in V(G)
        for each vertex i in V(G)
            for each vertex j in V(G)
                if dist[i][j] > dist[i][k] + dist[k][j] 
                    dist[i][j] ← dist[i][k] + dist[k][j]
                end if
            end for
        end for
    end for

    d ← 0

    for each vertex i in V(G)
        for each vertex j in V(G)
            if d < dist[i][j]
                d ← d[i][j]
            end if
        end for
    end for

    return d
end procedure
```

## Complexity
This implementation of the algorithm runs in $O(n^{3})$, where $n$ is the number of vertices.  

## Example
TO DO
 
## Comments

For sparse graphs with non-negative edge weights, lower asymptotic complexity can be obtained by running Dijkstra's algorithm (using Fibonacci heaps) from each possible starting vertex  than running the Floyd–Warshall algorithm. 

There are also known algorithms using fast matrix multiplication to speed up all-pairs shortest path computation in dense graphs, but these typically make extra assumptions on the edge weights (such as requiring them to be small integers). In addition, because of the high constant factors in their running time, they would only provide a speedup over the Floyd–Warshall algorithm for very large graphs. 

## More information
  - [Distance on Wikipedia](https://en.wikipedia.org/wiki/Distance_(graph_theory))
  - [Floyd Warshall algorithm on Wikipedia](https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm)
  - [Dijkstra'a algorithm on Wikipedia](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)

## Changes

  - **v1** Initial implementation of Floyd Warshall algorithm 