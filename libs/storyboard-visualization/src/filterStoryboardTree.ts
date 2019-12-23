import { matchPath, computeRealRoutePath } from "@easyops/brick-utils";
import { MicroApp } from "@easyops/brick-types";
import {
  StoryboardTree,
  AbstractStoryboardNode,
  StoryboardNodeRoutedBrick
} from "./interfaces";

export interface FilterOptions {
  path?: string;
}

function matchRoute(
  node: StoryboardNodeRoutedBrick,
  appData: MicroApp,
  path: string
): boolean {
  return (
    matchPath(path, {
      path: computeRealRoutePath(node.routeData.path, appData),
      exact: node.routeData.exact
    }) !== null
  );
}

function filterStoryboardNode(
  node: AbstractStoryboardNode,
  appData: MicroApp,
  options: FilterOptions
): AbstractStoryboardNode {
  if (options.path && node.children) {
    let children = node.children;
    if (node.type === "app" || node.type === "routes") {
      children = [
        children.find(child =>
          matchRoute(child as StoryboardNodeRoutedBrick, appData, options.path)
        )
      ].filter(Boolean);
    }
    node = {
      ...node,
      children: children.map(child =>
        filterStoryboardNode(child, appData, options)
      )
    };
  }
  return node;
}

export function filterStoryboardTree(
  tree: StoryboardTree,
  options: FilterOptions
): StoryboardTree {
  return filterStoryboardNode(tree, tree.appData, options) as StoryboardTree;
}
