# Is Connected (undirected)
This algorithm returns if an undirected graph $G$ is connected or not, that is if there is a path between any two pairs of vertices or not.
To compute the result, we use a **Depth-first search** algorithm (see pseudo-code below).  

**This parameter is not computed live.**

## Input/Output
- Input: An undirected graph $G$ 
- Output: True if and only if $G$ is connected.

## Pseudo Code

```

procedure DFS(G: Graph, v:vertex, visited:Map<vertex, boolean>)
    visited[v] ← true
    for all edges (v, w) in A(G) do
        if not visited[w]
            DFS(G, w, visited)
        end if
    end for
end procedure


procedure is_connected(G: Graph): boolean
    if |V(G)| < 2 
        return true
    end if
    
    visited ← new Map()
    
    for each vertex u in V(G)
        visited[u] ← false
    end for

    u ← an arbitrary vertex of G
    DFS(G, u, visited)

    for each vertex v in V(G)
        if not visited[v]
           return false
        end if
    end for

    return true
end procedure

```

## Complexity
This implementation of the algorithm runs in $O(n + m)$, where $n$ and $m$ are the number of vertices and edges, respectively.  

## Example
TO DO
 
## Comments

## More information
  - [Connectivity on Wikipedia](https://en.wikipedia.org/wiki/Connectivity_(graph_theory)) 
  - [Depth First Search algorithm on Wikipedia](https://en.wikipedia.org/wiki/Depth-first_search)

## Changes

  - **v1** Initial implementation of DFS algorithm 