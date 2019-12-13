import { StoryboardTree, StoryboardNode } from "./interfaces";

export function computeRoutes(tree: StoryboardTree): string[] {
  const routes = new Set<string>();

  function walk(node: StoryboardNode): void {
    if (node.type === "route") {
      const paths = Array.isArray(node.routeData.path)
        ? node.routeData.path
        : [node.routeData.path];
      paths.forEach(path => {
        routes.add(path);
      });
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  }

  walk(tree);

  return Array.from(routes);
}
