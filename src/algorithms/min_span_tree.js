import { cloneDeep } from "lodash";

// Finds minimum spanning tree using Prim's algorithm starting from given node
export const minspantreeprims = (edges, nodes, startNodeId) => {
  var _a;
  let mstSet = new Set();
  let visitedEdges = [];
  let nodeMap = new Map();
  let prev = new Map();
  let isGraphNotEligible = false;
  let newEdges = cloneDeep(edges);
  newEdges.forEach((edges) => {
    isGraphNotEligible =
      isGraphNotEligible ||
      (edges === null || edges === void 0
        ? void 0
        : edges.some((edge) => edge.type === "directed"));
  });
  if (isGraphNotEligible) {
    return [];
  }
  edges.forEach((_value, nodeId) => {
    nodeMap.set(nodeId, Infinity);
  });
  nodeMap.set(startNodeId, 0);
  prev.set(startNodeId, Infinity);
  for (let i = 0; i < nodes.length - 1; i++) {
    let minimumNodeId = getFromNotIncludedInMST(newEdges, mstSet, nodeMap);
    mstSet.add(minimumNodeId);
    (_a = newEdges.get(minimumNodeId)) === null || _a === void 0
      ? void 0
      : _a.forEach((edge) => {
          const nodeId = parseInt(edge.to);
          if (!mstSet.has(nodeId) && edge.weight < nodeMap.get(nodeId)) {
            nodeMap.set(nodeId, edge.weight);
            prev.set(nodeId, minimumNodeId);
          }
        });
  }
  visitedEdges = getVisitedEdges(prev, visitedEdges, nodes, startNodeId);
  return nodes.length === visitedEdges.length ? visitedEdges : [];
};

// Constructs array of edges in the minimum spanning tree
const getVisitedEdges = (prev, visitedEdges, nodes, startNodeId) => {
  var _a;
  const mockEdge = {
    x1: NaN,
    x2: NaN,
    y1: NaN,
    y2: NaN,
    nodeX2: NaN,
    nodeY2: NaN,
    from: "Infinity",
    to: startNodeId.toString(),
    type: "directed",
    weight: NaN,
    isUsedInTraversal: false,
  };
  for (let i = 0; i < nodes.length; i++) {
    if (prev.get(nodes[i].id) !== undefined) {
      visitedEdges.push(
        Object.assign(Object.assign({}, mockEdge), {
          from:
            (_a = prev.get(nodes[i].id)) === null || _a === void 0
              ? void 0
              : _a.toString(),
          to: nodes[i].id.toString(),
        })
      );
    }
  }
  return visitedEdges;
};

// Returns node with minimum weight that's not yet in MST
const getFromNotIncludedInMST = (edges, mstSet, nodeMap) => {
  let minimumWeight = Infinity;
  let minimumNodeId;
  edges.forEach((_value, nodeId) => {
    if (!mstSet.has(nodeId) && nodeMap.get(nodeId) < minimumWeight) {
      minimumWeight = nodeMap.get(nodeId);
      minimumNodeId = nodeId;
    }
  });
  return minimumNodeId;
};
