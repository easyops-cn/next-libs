import { Edge, RouteGraphNode } from "../interfaces";

export function getEdgesByNodes(nodes: RouteGraphNode[]): Edge[] {
  if (nodes) {
    const edges: Edge[] = [];
    nodes.forEach((node) => {
      if (node.originalData.segues) {
        const targets = Object.values(node.originalData.segues)
          .map((segue) => {
            const target = nodes.find(
              (n) => n.originalData.alias === segue.target
            );
            return (
              target && {
                source: node,
                target,
                controls: segue._view?.controls,
              }
            );
          })
          .filter(Boolean);
        edges.push(...targets);
      }
    });
    return edges;
  }
}
