import { sortBy, groupBy } from "lodash";
import { BuilderItem, BuilderNode } from "./interfaces";

export function builderToTree(list: BuilderItem[]): BuilderNode {
  if (list?.length === 1) {
    return builderItemToTree(list[0]);
  }
  return builderToTree([
    {
      alias: "APP",
      type: "app",
      children: list
    }
  ]);
}

const classNameMap = new Map<string, string>([
  ["brick", "brick"],
  ["provider", "brick"],
  ["template", "brick"],
  ["routes", "routes"],
  ["bricks", "routes"],
  ["redirect", "redirect"],
  ["app", "app"]
]);

export function getClassNameOfNodeType(type: string): string {
  if (classNameMap.has(type)) {
    return classNameMap.get(type);
  }
  return "node-type-unknown";
}

function builderItemToTree(data: BuilderItem): BuilderNode {
  const node: BuilderNode = {
    nodeData: data,
    groupIndex: 0,
    children: processChildren(data.children, shouldIgnoreGroup(data))
  };
  return node;
}

function shouldIgnoreGroup(data: BuilderItem): boolean {
  return ["routes", "bricks", "redirect", "app"].includes(data.type);
}

function processChildren(
  list: BuilderItem[],
  ignoreGroup?: boolean
): BuilderNode[] {
  const children: BuilderNode[] = [];
  if (Array.isArray(list)) {
    const sortedChildren = sortBy(list, ["sort"]);
    const groups = ignoreGroup
      ? sortedChildren.map(item => [item])
      : Object.values(groupBy(sortedChildren, "mountPoint"));
    let groupIndex = 0;
    for (const group of groups) {
      for (const child of group) {
        children.push({
          groupIndex,
          nodeData: child,
          children: processChildren(child.children, shouldIgnoreGroup(child))
        });
      }
      groupIndex += 1;
    }
  }
  return children;
}
