import { computeRealRoutePath } from "@easyops/brick-utils";
import { StoryboardTree, StoryboardNode } from "./interfaces";

export function computeRoutes(tree: StoryboardTree): string[] {
  const routes = new Set<string>();

  function walk(node: StoryboardNode): void {
    if (node.type === "brick" && node.brickType === "routed") {
      const realPaths = computeRealRoutePath(node.routeData.path, tree.appData);
      const paths = Array.isArray(realPaths) ? realPaths : [realPaths];
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
