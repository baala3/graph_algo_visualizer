import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Node } from '../Graph/Node/Node';
import styles from './Graph.module.css';
import {
  calculateAccurateCoords,
  findToNodeForTouchBasedDevices,
} from '../../utility/calc';
import { Modal, TextField, MessageBar, MessageBarType } from '@fluentui/react';
import { bfs } from '../../algorithms/bfs';
import { dfs } from '../../algorithms/dfs';
import { minspantreeprims } from '../../algorithms/min_span_tree';
import { dijkstra } from '../../algorithms/dijkstra';
import { cloneDeep } from 'lodash';
import { algoMessages } from '../../configs/readOnly';

var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (
        var i = 0, sym = Object.getOwnPropertySymbols(s);
        i < sym.length;
        i++
      ) {
        if (
          e.indexOf(sym[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, sym[i])
        )
          t[sym[i]] = s[sym[i]];
      }
    return t;
  };
export const Graph = (props) => {
  const {
    options,
    selectedEdge,
    selectedAlgo,
    visualizationSpeed,
    setVisualizingState,
    setNodeSelection,
    nodeSelection,
    isVisualizing,
  } = props;
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState(new Map());
  const [isModalOpen, setModalState] = useState(false);
  const [edge, setEdge] = useState(null);
  const [pathFindingNode, setPathFindingNode] = useState(null);
  const [isPathPossible, setPathPossible] = useState(true);
  const [isTraversalPossible, setTraversalPossible] = useState(true);
  const [mockEdge, setMockEdge] = useState(null);
  const currentNode = useRef();
  const currentEdge = useRef();
  const nodesTillNow = useRef(0);
  const graph = useRef();
  const isVisualizationDone = useRef(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const resetNodesAndEdgesState = useCallback(() => {
    let updateNodes = nodes.map((node) => {
      return Object.assign(Object.assign({}, node), {
        isInShortestPath: false,
        isVisited: false,
      });
    });
    let updatedEdges = cloneDeep(edges);
    updatedEdges.forEach((list, nodeId) => {
      let newList =
        list === null || list === void 0
          ? void 0
          : list.map((edge) => {
              return Object.assign(Object.assign({}, edge), {
                isUsedInTraversal: false,
                isUsedInShortestPath: false,
              });
            });
      updatedEdges.set(nodeId, newList);
    });
    setNodes(updateNodes);
    setEdges(updatedEdges);
    setPathFindingNode(null);
    isVisualizationDone.current = false;
  }, [nodes, edges]);
  useEffect(() => {
    graph.current.addEventListener('touchmove', (e) => e.preventDefault());
  }, []);
  useEffect(() => {
    //deletes the graph from the board.
    if (options.reset) {
      setNodes([]);
      setEdges(new Map());
      nodesTillNow.current = 0;
      isVisualizationDone.current = false;
    }
  }, [options.reset]);
  useEffect(() => {
    //whenever the selected Algorithm changes, set pathfinding node to null.
    setPathFindingNode(null);
  }, [selectedAlgo]);
  useEffect(() => {
    //Whenever options change and the visualization is recently competed,reset the graph to its pre-visualized state.
    if (isVisualizationDone.current) {
      resetNodesAndEdgesState();
    }
  }, [options, resetNodesAndEdgesState]);
  useEffect(() => {
    if (nodes.length > 0) {
      setShowWelcomeMessage(false);
    } else {
      setShowWelcomeMessage(true);
    }
  }, [nodes]);
  //add a new node to the graph
  const addNode = (event) => {
    const target = event.target;
    let nodeX = event.clientX - target.getBoundingClientRect().left;
    let nodeY = event.clientY - target.getBoundingClientRect().top;
    nodesTillNow.current += 1;
    let newNode = {
      id: nodesTillNow.current,
      x: nodeX,
      y: nodeY,
      r: 30,
    };
    edges.set(nodesTillNow.current, []);
    setEdges(edges);
    setNodes([...nodes, newNode]);
  };
  //delete an existing node from the graph
  const deleteNode = (event) => {
    const target = event.target;
    let newNodes = nodes.filter((node) => node.id !== parseInt(target.id));
    edges.forEach((list, nodeId) => {
      let newList =
        list === null || list === void 0
          ? void 0
          : list.filter((edge) => target.id !== edge.to);
      edges.set(nodeId, newList);
    });
    edges.delete(parseInt(target.id));
    setEdges(edges);
    setNodes(newNodes);
  };
  //handles the logic for setting nodes and edges state for visualization
  const visualizeSetState = (currentEdge, edgeAttribute, nodeAttribute) => {
    edges.forEach((list) => {
      list === null || list === void 0
        ? void 0
        : list.forEach((edge) => {
            var _a;
            if (
              edge.type === 'directed' &&
              edge.from === currentEdge.from &&
              edge.to === currentEdge.to
            ) {
              edge[edgeAttribute] = true;
            }
            if (edge.type === 'undirected') {
              if (
                edge.from === currentEdge.from &&
                edge.to === currentEdge.to
              ) {
                edge[edgeAttribute] = true;
                (_a = edges.get(parseInt(currentEdge.to))) === null ||
                _a === void 0
                  ? void 0
                  : _a.forEach((edge) => {
                      if (edge.to === currentEdge.from) {
                        edge[edgeAttribute] = true;
                      }
                    });
              }
            }
          });
    });
    setEdges(edges);
    let updatedNodes = [...nodes];
    updatedNodes.forEach((node) => {
      if (node.id === parseInt(currentEdge.to)) {
        node[nodeAttribute] = true;
      }
    });
    setNodes(updatedNodes);
  };
  //visualize shortest path logic
  const visualizeShortestPath = (shortestPath) => {
    for (let i = 0; i <= shortestPath.length; i++) {
      if (i === shortestPath.length) {
        setTimeout(() => {
          setVisualizingState(false);
          setNodeSelection(
            Object.assign(Object.assign({}, nodeSelection), {
              isStartNodeSelected: false,
              isEndNodeSelected: false,
            })
          );
          isVisualizationDone.current = true;
        }, visualizationSpeed * i);
        return;
      }
      setTimeout(() => {
        const currentEdge = shortestPath[i];
        const isNodeIsInShortedPath = nodes.some((node) => {
          if (node.id === parseInt(currentEdge.to)) {
            return node.isInShortestPath === true;
          }
          return false;
        });
        if (!isNodeIsInShortedPath) {
          visualizeSetState(
            currentEdge,
            'isUsedInShortestPath',
            'isInShortestPath'
          );
        }
      }, visualizationSpeed * i);
    }
  };
  //visualize the visited nodes and shortestPath if applicable
  const visualizeGraph = (visitedEdges, shortestPath = []) => {
    setNodeSelection(
      Object.assign(Object.assign({}, nodeSelection), {
        isStartNodeSelected: false,
        isEndNodeSelected: false,
      })
    );
    setVisualizingState(true);
    for (let i = 0; i <= visitedEdges.length; i++) {
      if (i === visitedEdges.length) {
        setTimeout(() => {
          setPathFindingNode(null);
          visualizeShortestPath(shortestPath);
        }, visualizationSpeed * i);
        return;
      }
      setTimeout(() => {
        const currentEdge = visitedEdges[i];
        const isNodeTraversed = nodes.some((node) => {
          if (node.id === parseInt(currentEdge.to)) {
            return node.isVisited === true;
          }
          return false;
        });
        if (!isNodeTraversed) {
          visualizeSetState(currentEdge, 'isUsedInTraversal', 'isVisited');
        }
      }, visualizationSpeed * i);
    }
  };
  //common handler for adding new nodes,deleting existing nodes and selecting nodes for visualization
  const handleSelect = (event) => {
    const target = event.target;
    const isNode = target.tagName === 'circle';
    if (options.drawNode && !isNode) {
      addNode(event);
    } else if (options.deleteNode && isNode) {
      deleteNode(event);
    } else if (
      (selectedAlgo === null || selectedAlgo === void 0
        ? void 0
        : selectedAlgo.data) === 'traversal' &&
      isNode &&
      !isVisualizing
    ) {
      const startNodeId = parseInt(target.id);
      if (
        (selectedAlgo === null || selectedAlgo === void 0
          ? void 0
          : selectedAlgo.key) === 'bfs'
      ) {
        let visitedEdges = bfs(edges, startNodeId);
        visualizeGraph(visitedEdges);
      } else if (
        (selectedAlgo === null || selectedAlgo === void 0
          ? void 0
          : selectedAlgo.key) === 'dfs'
      ) {
        let visitedEdges = dfs(edges, startNodeId);
        visualizeGraph(visitedEdges);
      } else if (selectedAlgo.key === 'minspantreeprims') {
        let visitedEdges = minspantreeprims(edges, nodes, startNodeId);
        if (visitedEdges.length !== 0) visualizeGraph(visitedEdges);
        else {
          setTraversalPossible(false);
          setVisualizingState(true);
          setNodeSelection(
            Object.assign(Object.assign({}, nodeSelection), {
              isStartNodeSelected: false,
              isEndNodeSelected: false,
            })
          );
          setTimeout(() => {
            setTraversalPossible(true);
            setVisualizingState(false);
          }, 2500);
        }
      }
    } else if (
      (selectedAlgo === null || selectedAlgo === void 0
        ? void 0
        : selectedAlgo.data) === 'pathfinding' &&
      isNode &&
      !isVisualizing
    ) {
      if (!pathFindingNode) {
        setPathFindingNode({ startNodeId: parseInt(target.id), endNodeId: -1 });
      } else {
        const startNodeId = pathFindingNode.startNodeId;
        const endNodeId = parseInt(target.id);
        setPathFindingNode(
          Object.assign(Object.assign({}, pathFindingNode), { endNodeId })
        );
        let output = dijkstra(edges, startNodeId, endNodeId);
        if (
          (output === null || output === void 0
            ? void 0
            : output.shortestPath.length) !== 0 &&
          (output === null || output === void 0 ? void 0 : output.visitedEdges)
        ) {
          visualizeGraph(output.visitedEdges, output.shortestPath);
        } else {
          setPathPossible(false);
          setVisualizingState(true);
          setNodeSelection(
            Object.assign(Object.assign({}, nodeSelection), {
              isStartNodeSelected: false,
              isEndNodeSelected: false,
            })
          );
          setTimeout(() => {
            setPathPossible(true);
            setVisualizingState(false);
            setPathFindingNode(null);
          }, 2500);
        }
      }
    }
  };
  //updates node coordinates when moving it
  const updateNodeCoord = (x, y) => {
    let newNodes = nodes.map((node) => {
      if (node.id === parseInt(currentNode.current.id)) {
        return Object.assign(Object.assign({}, node), { x, y });
      }
      return node;
    });
    setNodes(newNodes);
  };
  //updates edge coordinates when moving nodes
  const updateEdgeCoord = (x, y) => {
    var _a;
    let newBegEdgePositionsForNode =
      (_a =
        edges === null || edges === void 0
          ? void 0
          : edges.get(parseInt(currentNode.current.id))) === null ||
      _a === void 0
        ? void 0
        : _a.map((edge) => {
            let { tempX, tempY } = calculateAccurateCoords(
              x,
              y,
              edge.nodeX2,
              edge.nodeY2
            );
            return Object.assign(Object.assign({}, edge), {
              x1: x,
              y1: y,
              x2: tempX,
              y2: tempY,
            });
          });
    edges.set(parseInt(currentNode.current.id), newBegEdgePositionsForNode);
    edges.forEach((list, nodeId) => {
      let newList =
        list === null || list === void 0
          ? void 0
          : list.map((edge) => {
              if (currentNode.current.id === edge.to) {
                let { tempX, tempY } = calculateAccurateCoords(
                  edge.x1,
                  edge.y1,
                  edge.nodeX2,
                  edge.nodeY2
                );
                return Object.assign(Object.assign({}, edge), {
                  x2: tempX,
                  y2: tempY,
                  nodeX2: x,
                  nodeY2: y,
                });
              }
              return edge;
            });
      edges.set(nodeId, newList);
    });
    setEdges(edges);
  };
  //add a new edge between two nodes
  const addEdge = (id, tagName, x, y) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (currentEdge.current) {
      let x1 = currentEdge.current.x1;
      let y1 = currentEdge.current.y1;
      let x2 = x;
      let y2 = y;
      let nodeX2 = x2;
      let nodeY2 = y2;
      currentEdge.current.to = id;
      const isEdgeNotPresent =
        ((_a =
          edges === null || edges === void 0
            ? void 0
            : edges.get(parseInt(currentEdge.current.from))) === null ||
        _a === void 0
          ? void 0
          : _a.length) !== 0
          ? (_b =
              edges === null || edges === void 0
                ? void 0
                : edges.get(parseInt(currentEdge.current.from))) === null ||
            _b === void 0
            ? void 0
            : _b.every((edge) => edge.to !== currentEdge.current.to)
          : true;
      const isNotCurrentNode =
        currentEdge.current.from !== currentEdge.current.to;
      const isEdgePossible = isEdgeNotPresent && isNotCurrentNode;
      if (isEdgePossible) {
        if (
          (selectedEdge === null || selectedEdge === void 0
            ? void 0
            : selectedEdge.key) === 'directed'
        ) {
          let { tempX: tempX2, tempY: tempY2 } = calculateAccurateCoords(
            x1,
            y1,
            x2,
            y2
          );
          const fromNodeId = parseInt(currentEdge.current.from);
          let toNode = __rest(currentEdge.current, []);
          toNode.x2 = tempX2;
          toNode.y2 = tempY2;
          toNode.nodeX2 = nodeX2;
          toNode.nodeY2 = nodeY2;
          toNode.type = 'directed';
          (_c =
            edges === null || edges === void 0
              ? void 0
              : edges.get(fromNodeId)) === null || _c === void 0
            ? void 0
            : _c.push(toNode);
        } else if (
          (selectedEdge === null || selectedEdge === void 0
            ? void 0
            : selectedEdge.key) === 'undirected'
        ) {
          const fromNodeId = parseInt(currentEdge.current.from);
          const toNodeId = parseInt(currentEdge.current.to);
          const isUndirectedEdgeNotPossible =
            ((_d =
              edges === null || edges === void 0
                ? void 0
                : edges.get(fromNodeId)) === null || _d === void 0
              ? void 0
              : _d.some((edge) => parseInt(edge.to) === toNodeId)) ||
            ((_e =
              edges === null || edges === void 0
                ? void 0
                : edges.get(toNodeId)) === null || _e === void 0
              ? void 0
              : _e.some((edge) => parseInt(edge.to) === fromNodeId));
          if (!isUndirectedEdgeNotPossible) {
            let { tempX: tempX2, tempY: tempY2 } = calculateAccurateCoords(
              x1,
              y1,
              x2,
              y2
            );
            let toNode = __rest(currentEdge.current, []);
            toNode.x2 = tempX2;
            toNode.y2 = tempY2;
            toNode.nodeX2 = nodeX2;
            toNode.nodeY2 = nodeY2;
            toNode.type = 'undirected';
            (_f =
              edges === null || edges === void 0
                ? void 0
                : edges.get(fromNodeId)) === null || _f === void 0
              ? void 0
              : _f.push(toNode);
            let { tempX: tempX1, tempY: tempY1 } = calculateAccurateCoords(
              x2,
              y2,
              x1,
              y1
            );
            let fromNode = {
              x1: x2,
              y1: y2,
              x2: tempX1,
              y2: tempY1,
              nodeX2: x1,
              nodeY2: y1,
              from: currentEdge.current.to,
              to: currentEdge.current.from,
              type: 'undirected',
              weight: currentEdge.current.weight,
            };
            (_g =
              edges === null || edges === void 0
                ? void 0
                : edges.get(toNodeId)) === null || _g === void 0
              ? void 0
              : _g.push(fromNode);
          }
        }
        setEdges(edges);
      }
    }
  };
  //common handler for deletion and edition of edges.
  const handleEdge = (edge, fromNode) => {
    if (options.deleteEdge) {
      deleteEdge(edge, fromNode.id);
    } else if (options.editEdge) {
      editEdge(edge, fromNode);
    }
  };
  //delete edge functionality
  const deleteEdge = (currentEdge, fromNode) => {
    var _a, _b, _c;
    if (currentEdge.type === 'directed') {
      let upgradedEdges =
        (_a =
          edges === null || edges === void 0 ? void 0 : edges.get(fromNode)) ===
          null || _a === void 0
          ? void 0
          : _a.filter((edge) => edge.to !== currentEdge.to);
      let newEdges = new Map(edges);
      newEdges.set(fromNode, upgradedEdges);
      setEdges(newEdges);
    } else if (currentEdge.type === 'undirected') {
      let upgradedOutgoingEdges =
        (_b =
          edges === null || edges === void 0 ? void 0 : edges.get(fromNode)) ===
          null || _b === void 0
          ? void 0
          : _b.filter((edge) => edge.to !== currentEdge.to);
      let upgradedIncomingEdges =
        (_c =
          edges === null || edges === void 0
            ? void 0
            : edges.get(parseInt(currentEdge.to))) === null || _c === void 0
          ? void 0
          : _c.filter((edge) => edge.to !== fromNode.toString());
      let newEdges = new Map(edges);
      newEdges.set(fromNode, upgradedOutgoingEdges);
      newEdges.set(parseInt(currentEdge.to), upgradedIncomingEdges);
      setEdges(newEdges);
    }
  };
  //function called when edit Edge button is clicked.
  const editEdge = (edge, fromNode) => {
    currentNode.current = Object.assign({}, fromNode);
    setEdge(edge);
    setModalState(true);
  };
  //function that actually contains the logic for setting weight of selected edge.
  const editEdgeWeight = () => {
    var _a, _b, _c;
    let currentEdge = Object.assign({}, edge);
    if (
      (edge === null || edge === void 0 ? void 0 : edge.type) === 'directed'
    ) {
      let upgradedEdges =
        (_a =
          edges === null || edges === void 0
            ? void 0
            : edges.get(currentNode.current.id)) === null || _a === void 0
          ? void 0
          : _a.map((edge) => {
              if (edge.to === currentEdge.to) {
                return Object.assign(Object.assign({}, edge), {
                  weight: currentEdge.weight,
                });
              }
              return edge;
            });
      let newEdges = new Map(edges);
      newEdges.set(currentNode.current.id, upgradedEdges);
      setEdges(newEdges);
    } else if (
      (edge === null || edge === void 0 ? void 0 : edge.type) === 'undirected'
    ) {
      let upgradedOutgoingEdges =
        (_b =
          edges === null || edges === void 0
            ? void 0
            : edges.get(currentNode.current.id)) === null || _b === void 0
          ? void 0
          : _b.map((edge) => {
              if (edge.to === currentEdge.to) {
                return Object.assign(Object.assign({}, edge), {
                  weight: currentEdge.weight,
                });
              }
              return edge;
            });
      let upgradedIncomingEdges =
        (_c =
          edges === null || edges === void 0
            ? void 0
            : edges.get(parseInt(currentEdge.to))) === null || _c === void 0
          ? void 0
          : _c.map((edge) => {
              if (edge.to === currentNode.current.id.toString()) {
                return Object.assign(Object.assign({}, edge), {
                  weight: currentEdge.weight,
                });
              }
              return edge;
            });
      let newEdges = new Map(edges);
      newEdges.set(currentNode.current.id, upgradedOutgoingEdges);
      newEdges.set(parseInt(currentEdge.to), upgradedIncomingEdges);
      setEdges(newEdges);
    }
    setModalState(false);
  };
  //common handler for movement related operations - moving node and drawing edges.
  const handleMove = (event) => {
    let canMoveNode = options.moveNode;
    let canDrawEdge =
      (selectedEdge === null || selectedEdge === void 0
        ? void 0
        : selectedEdge.key) &&
      (selectedEdge.key === 'directed' || selectedEdge.key === 'undirected');
    if (canMoveNode) {
      currentNode.current = event.target;
      //logic for movement of nodes.
      const handleNodeMove = (event) => {
        let nodeX = event.clientX - graph.current.getBoundingClientRect().left;
        let nodeY = event.clientY - graph.current.getBoundingClientRect().top;
        currentNode.current.setAttribute('cx', nodeX);
        currentNode.current.setAttribute('cy', nodeY);
        currentNode.current.nextElementSibling.setAttribute('x', nodeX);
        currentNode.current.nextElementSibling.setAttribute('y', nodeY + 5);
        updateNodeCoord(nodeX, nodeY);
        updateEdgeCoord(nodeX, nodeY);
      };
      //function triggered to remove mouse event listeners.
      const handleNodeEnd = () => {
        graph.current.removeEventListener('pointermove', handleNodeMove);
        graph.current.removeEventListener('pointerup', handleNodeEnd);
      };
      graph.current.addEventListener('pointermove', handleNodeMove);
      graph.current.addEventListener('pointerup', handleNodeEnd);
    } else if (canDrawEdge) {
      currentNode.current = event.target;
      //logic for drawing of edges.
      const handleArrowMove = (event) => {
        let arrowX = event.clientX - graph.current.getBoundingClientRect().left;
        let arrowY = event.clientY - graph.current.getBoundingClientRect().top;
        currentEdge.current = {
          x1: parseInt(currentNode.current.getAttribute('cx')),
          y1: parseInt(currentNode.current.getAttribute('cy')),
          x2: arrowX,
          y2: arrowY,
          from: currentNode.current.id,
          to: '',
          weight: 0,
        };
        setMockEdge(currentEdge.current);
      };
      //function triggered to remove mouse event listeners.
      const handleArrowEnd = (event) => {
        const isTouchEvent = event.pointerType === 'touch';
        if (isTouchEvent) {
          const node = findToNodeForTouchBasedDevices(
            event.clientX - graph.current.getBoundingClientRect().left,
            event.clientY - graph.current.getBoundingClientRect().top,
            nodes
          );
          if (node) {
            addEdge(node.id.toString(), 'circle', node.x, node.y);
          }
        } else {
          const target = event.target;
          const isNode = target.tagName === 'circle';
          if (isNode) {
            const x = parseInt(target.getAttribute('cx'));
            const y = parseInt(target.getAttribute('cy'));
            addEdge(target.id, 'circle', x, y);
          }
        }
        setMockEdge(null);
        currentEdge.current = undefined;
        graph.current.removeEventListener('pointermove', handleArrowMove);
        graph.current.removeEventListener('pointerup', handleArrowEnd);
      };
      graph.current.addEventListener('pointermove', handleArrowMove);
      graph.current.addEventListener('pointerup', handleArrowEnd);
    }
  };
  return (
    <>
      {showWelcomeMessage && (
        <MessageBar
          className={styles.welcomeMessage}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
          styles={{ text: { fontWeight: 'bold', fontSize: '14px' } }}
        >
          Build your own graph with nodes and edges, then explore algorithms in
          action!
        </MessageBar>
      )}
      {selectedAlgo?.data === 'traversal' &&
        (isTraversalPossible ? (
          <MessageBar
            className={styles.traversal}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
            styles={{ text: { fontWeight: 'bold', fontSize: '14px' } }}
          >
            {algoMessages[selectedAlgo?.data][selectedAlgo.key]['info']}
          </MessageBar>
        ) : (
          <MessageBar
            className={styles.pathError}
            messageBarType={MessageBarType.error}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
            styles={{ text: { fontWeight: 'bold', fontSize: '14px' } }}
          >
            {algoMessages[selectedAlgo?.data][selectedAlgo.key]['failure']}
          </MessageBar>
        ))}
      {selectedAlgo?.data === 'pathfinding' &&
        (isPathPossible ? (
          <MessageBar
            className={styles.pathfinding}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
            styles={{ text: { fontWeight: 'bold', fontSize: '14px' } }}
          >
            {algoMessages[selectedAlgo?.data][selectedAlgo.key]['info']}
          </MessageBar>
        ) : (
          <MessageBar
            className={styles.pathError}
            messageBarType={MessageBarType.error}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
            styles={{ text: { fontWeight: 'bold', fontSize: '14px' } }}
          >
            {algoMessages[selectedAlgo?.data][selectedAlgo.key]['failure']}
          </MessageBar>
        ))}
      <svg ref={graph} className={styles.graph} onClick={handleSelect}>
        {nodes.map((node) => (
          <Node
            handleEdge={handleEdge}
            handleMove={handleMove}
            key={node.id}
            node={node}
            edges={edges}
            deleteEdgeMode={options.deleteEdge}
            deleteNodeMode={options.deleteNode}
            editEdgeMode={options.editEdge}
            readyForVisualization={nodeSelection.isStartNodeSelected}
            readyForMovement={options.moveNode}
            readyForEdge={selectedEdge?.key !== 'select'}
            pathFindingNode={pathFindingNode}
          />
        ))}
        {mockEdge && (
          <>
            {selectedEdge?.key === 'directed' && (
              <marker
                className={styles.mockArrow}
                id="mockArrowHead"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            )}
            <line
              className={styles.mockEdge}
              x1={mockEdge.x1}
              y1={mockEdge.y1}
              x2={mockEdge.x2}
              y2={mockEdge.y2}
              markerEnd="url(#mockArrowHead)"
            ></line>
          </>
        )}
      </svg>
      <Modal
        styles={{
          main: {
            minHeight: '0px',
            minWidth: '0px',
            height: 'auto',
            backgroundColor: 'rgba(65, 68, 160, 0.9)',
            overflow: 'hidden',
          },
          scrollableContent: {
            display: 'flex',
            msOverflowStyle: 'none', // Hide scrollbar IE and Edge
            scrollbarWidth: 'none', // Hide scrollbar Firefox
            '&::-webkit-scrollbar': {
              display: 'none', // Hide scrollbar Chrome, Safari, Opera
            },
          },
        }}
        isOpen={isModalOpen}
      >
        {edge && edge.weight !== null && (
          <>
            <TextField
              styles={{ fieldGroup: { border: 'none' } }}
              type="number"
              min={0}
              max={500}
              value={edge.weight.toString()}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  editEdgeWeight();
                }
              }}
              onChange={(e) => {
                parseInt(e.target.value) >= 0 && parseInt(e.target.value) <= 500
                  ? setEdge({ ...edge, weight: parseInt(e.target.value) })
                  : e.preventDefault();
              }}
            />
            <button className={styles.modalButton} onClick={editEdgeWeight}>
              Set Weight
            </button>
          </>
        )}
      </Modal>
    </>
  );
};
