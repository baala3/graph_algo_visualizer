// Finds shortest path between start and end nodes using Dijkstra's algorithm
export const dijkstra = (edges, startNodeId, endNodeId) => {
  const mockEdge = {
    x1: NaN,
    x2: NaN,
    y1: NaN,
    y2: NaN,
    nodeX2: NaN,
    nodeY2: NaN,
    from: 'Infinity',
    to: startNodeId.toString(),
    type: 'directed',
    weight: NaN,
    isUsedInTraversal: false,
  };
  if (startNodeId === endNodeId)
    return { shortestPath: [mockEdge], visitedEdges: [mockEdge] };
  let newEdges = new Map(edges);
  let distance = new Map();
  let prev = new Map();
  let unvisitedSet = new Set();
  let visitedEdges = [];
  distance.set(mockEdge, 0);
  newEdges.forEach((edges, nodeId) => {
    edges === null || edges === void 0
      ? void 0
      : edges.forEach((edge) => {
          distance.set(edge, Infinity);
        });
    unvisitedSet.add(nodeId);
  });
  let currentEdge = mockEdge;
  let currentNodeId = parseInt(currentEdge.to);
  visitedEdges.push(currentEdge);
  unvisitedSet.delete(currentNodeId);
  while (unvisitedSet.size !== 0) {
    getUnvisitedNeighbours(currentEdge, newEdges, distance, unvisitedSet, prev);
    currentEdge = getSmallestUnvisited(distance, unvisitedSet);
    if (currentEdge === undefined || distance.get(currentEdge) === Infinity) {
      return {
        shortestPath: [],
        visitedEdges: visitedEdges,
      };
    }
    currentNodeId = parseInt(currentEdge.to);
    visitedEdges.push(currentEdge);
    unvisitedSet.delete(currentNodeId);
    if (currentNodeId === endNodeId) {
      return {
        shortestPath: backtrack(prev, startNodeId, endNodeId),
        visitedEdges: visitedEdges,
      };
    }
  }
};

// Reconstructs the shortest path by backtracking from end to start node
const backtrack = (prev, startNodeId, endNodeId) => {
  const mockEdge = {
    x1: NaN,
    x2: NaN,
    y1: NaN,
    y2: NaN,
    nodeX2: NaN,
    nodeY2: NaN,
    from: 'Infinity',
    to: startNodeId.toString(),
    type: 'directed',
    weight: NaN,
    isUsedInTraversal: false,
  };
  const visitedOrder = [];
  const visitedEdges = [];
  let currentNodeId = endNodeId;
  visitedOrder.push(currentNodeId);
  while (prev.has(currentNodeId)) {
    currentNodeId = prev.get(currentNodeId);
    visitedOrder.push(currentNodeId);
  }
  visitedOrder.reverse();
  visitedEdges.push(mockEdge);
  for (let i = 0; i < visitedOrder.length - 1; i++) {
    visitedEdges.push(
      Object.assign(Object.assign({}, mockEdge), {
        from: visitedOrder[i].toString(),
        to: visitedOrder[i + 1].toString(),
      })
    );
  }
  return visitedEdges;
};

// Returns the unvisited edge with smallest distance value
const getSmallestUnvisited = (distance, unvisitedSet) => {
  let smallestUnvisited = [];
  distance.forEach((_value, edge) => {
    if (unvisitedSet.has(parseInt(edge.to))) {
      smallestUnvisited.push(edge);
    }
  });
  return smallestUnvisited.sort((a, b) => distance.get(a) - distance.get(b))[0];
};

// Updates distances to unvisited neighbors of current node
const getUnvisitedNeighbours = (
  currentEdge,
  edges,
  distance,
  unvisitedSet,
  prev
) => {
  var _a;
  let currentNodeId = parseInt(currentEdge.to);
  if (edges.get(currentNodeId)) {
    (_a = edges.get(currentNodeId)) === null || _a === void 0
      ? void 0
      : _a.forEach((edge) => {
          if (unvisitedSet.has(parseInt(edge.to))) {
            let shouldCompare = true;
            let newDistance = distance.get(currentEdge) + edge.weight;
            distance.forEach((value, d_edge) => {
              if (
                edge.to === d_edge.to &&
                value !== Infinity &&
                value <= newDistance
              ) {
                shouldCompare = false;
              }
            });
            if (shouldCompare && newDistance < distance.get(edge)) {
              distance.set(edge, newDistance);
              prev.set(parseInt(edge.to), currentNodeId);
            }
          }
        });
  }
};
