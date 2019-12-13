import { matchPath } from "@easyops/brick-utils";
import {
  StoryboardTree,
  StoryboardNodeRoute,
  AbstractStoryboardNode
} from "./interfaces";

export interface FilterOptions {
  path?: string;
}

function matchRoute(node: StoryboardNodeRoute, path: string): boolean {
  return (
    matchPath(path, {
      path: node.routeData.path,
      exact: node.routeData.exact
    }) !== null
  );
}

function filterStoryboardNode(
  node: AbstractStoryboardNode,
  options: FilterOptions
): AbstractStoryboardNode {
  if (options.path && node.children) {
    let children = node.children;
    if (
      node.type === "app" ||
      (node.type === "slot" && node.slotType === "routes")
    ) {
      children = [
        children.find(child =>
          matchRoute(child as StoryboardNodeRoute, options.path)
        )
      ].filter(Boolean);
    }
    node = {
      ...node,
      children: children.map(child => filterStoryboardNode(child, options))
    };
  }
  return node;
}

export function filterStoryboardTree(
  tree: StoryboardTree,
  options: FilterOptions
): StoryboardTree {
  return filterStoryboardNode(tree, options) as StoryboardTree;
}
