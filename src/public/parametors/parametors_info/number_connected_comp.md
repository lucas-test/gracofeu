# Number connected component (undirected)
A connected component is a maximal connected subgraph of an undirected graph. Each vertex belongs to exactly one connected component. 
This algorithm returns the number of connected components an undirected graph $G$ have. 

To compute the result, we use a **Depth-first search** algorithm (see pseudo-code below).  


## Input/Output
- Input: An undirected graph $G$ 
- Output: The number of connected components of $G$.

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


procedure is_connected(G: Graph): number
    if |V(G)| < 1 
        return 0
    end if
    
    visited ← new Map()
    for each vertex u in V(G)
        visited[u] ← false
    end for

    nb_cc ← 0
    all_visited ← false
    while not all_visited 
        all_visited ← true

        for each vertex v in V(G)
            if not visited[v]
                initial_vertex ← v
                all_visited ← false
                nb_cc ← nb_cc + 1
                break
            end if
        end for

        if all_visited
            break
        end if


        DFS(G, initial_vertex, visited)
    end while

    return nb_cc

```

## Complexity
This implementation of the algorithm runs in $O(n + m)$, where $n$ and $m$ are the number of vertices and edges, respectively.  

## Example
TO DO
 
## Comments

## More information
  - [Connectivity on Wikipedia](https://en.wikipedia.org/wiki/Connectivity_(graph_theory)) 
  - [Component on Wikipedia](https://en.wikipedia.org/wiki/Component_(graph_theory))
  - [Depth First Search algorithm on Wikipedia](https://en.wikipedia.org/wiki/Depth-first_search)

## Changes

  - **v1** Initial implementation of DFS algorithm 