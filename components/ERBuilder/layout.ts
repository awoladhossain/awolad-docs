import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'LR'
): { nodes: Node[]; edges: Edge[] } => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    // A standard table node is 288px wide
    // Dynamic height based on column rows count
    const colCount = (node.data as any).columns?.length || 0;
    const estimatedHeight = 80 + colCount * 45;

    dagreGraph.setNode(node.id, { width: 288, height: estimatedHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const colCount = (node.data as any).columns?.length || 0;
    const estimatedHeight = 80 + colCount * 45;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 144, // center horizontally
        y: nodeWithPosition.y - estimatedHeight / 2, // center vertically
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
