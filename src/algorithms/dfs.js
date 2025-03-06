import { Stack } from '../data-structures/Stack';

// Performs depth-first search traversal starting from given node
export const dfs = (edges, startNodeId) => {
  let dfsStack = new Stack();
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
  dfsStack.push(mockEdge);
  const visitedSet = new Set();
  const visitedEdges = [];
  let newEdges = new Map(edges);
  while (!dfsStack.isEmpty()) {
    let lastVisitedEdge = dfsStack.top();
    let nodeId = parseInt(lastVisitedEdge.to);
    dfsStack.pop();
    if (!visitedSet.has(parseInt(lastVisitedEdge.to))) {
      visitedEdges.push(
        Object.assign(Object.assign({}, mockEdge), {
          from: lastVisitedEdge.from,
          to: lastVisitedEdge.to,
        })
      );
      const neighbours = findNeighbours(nodeId, newEdges, visitedSet);
      neighbours === null || neighbours === void 0
        ? void 0
        : neighbours.forEach((id) => {
            dfsStack.push(
              Object.assign(Object.assign({}, mockEdge), {
                from: nodeId.toString(),
                to: id.toString(),
              })
            );
          });
    }
  }
  return visitedEdges;
};

// Returns array of unvisited neighbor nodes for given nodeId
const findNeighbours = (nodeId, edges, visitedSet) => {
  var _a;
  if (!visitedSet.has(nodeId)) {
    visitedSet.add(nodeId);
    return (_a = edges.get(nodeId)) === null || _a === void 0
      ? void 0
      : _a.map((edge) => {
          return parseInt(edge.to);
        });
  }
  return [];
};
