import { matchPath, computeRealRoutePath } from "@easyops/brick-utils";
import { MicroApp } from "@easyops/brick-types";
import {
  StoryboardTree,
  AbstractStoryboardNode,
  StoryboardNodeRoutedChild
} from "./interfaces";

export interface FilterOptions {
  path?: string;
}

function matchRoute(
  node: StoryboardNodeRoutedChild,
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
      const matchedNode = children.find(child =>
        matchRoute(child as StoryboardNodeRoutedChild, appData, options.path)
      );
      if (matchedNode) {
        children = children.filter(
          child => child.groupIndex === matchedNode.groupIndex
        );
      } else {
        children = [];
      }
    }
    node = {
      ...node,
      $$originalNode: node,
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
