import { sortBy, groupBy, isEmpty } from "lodash";
import {
  GraphNode,
  GraphNodeContent,
  GraphNodeContentSlotGroup,
} from "./interfaces";
import { ViewItem } from "../shared/interfaces";
import { styleConfig } from "./constants";
import { HierarchyPointLink } from "d3";

export function viewsToGraph(
  views: ViewItem[],
  wrapAnApp?: boolean | "auto"
): GraphNode {
  if (
    (wrapAnApp === false && views?.length >= 1) ||
    (wrapAnApp !== true && views?.length === 1)
  ) {
    if (views[0].type === "custom-template") {
      return ViewItemToGraph({
        alias: "Custom Template",
        type: "tpl-root",
        children: sortViews(views || []),
      });
    }
    return ViewItemToGraph(views[0]);
  }
  return viewsToGraph(
    [
      {
        alias: "APP",
        type: "app-root",
        children: sortViews(views || []),
      },
    ],
    false
  );
}

function ViewItemToGraph(view: ViewItem): GraphNode {
  const nodeType = isRouteNode(view)
    ? "route"
    : isBrickNode(view)
    ? "brick"
    : "unknown";
  const node: GraphNode = {
    nodeType,
    originalData: view,
    content: getNodeContent(view),
    children: sortViews(view.children)
      // Ignore nodes that has no children.
      .filter((child) => !isEmpty(child.children))
      .map((child) => ViewItemToGraph(child)),
  };
  node.height = computeNodeHeight(node);
  return node;
}

export function isRouteNode(view: ViewItem): boolean {
  return ["bricks", "routes", "redirect"].includes(view.type);
}

export function isBrickNode(view: ViewItem): boolean {
  return ["brick", "provider", "template", "custom-template"].includes(
    view.type
  );
}

function getNodeContent(view: ViewItem): GraphNodeContent {
  switch (view.type) {
    case "bricks":
    case "routes":
    case "app-root":
    case "tpl-root":
    case "custom-template":
      return {
        type:
          view.type === "app-root"
            ? "routes"
            : view.type === "tpl-root"
            ? "custom-template"
            : view.type,
        items: sortViews(view.children),
      };
    case "redirect":
      return {
        type: "redirect",
      };
    case "brick":
      return {
        type: "slots",
        slots: getNodeContentSlotGroups(view),
      };
    default:
      return;
  }
}

function getNodeContentSlotGroups(view: ViewItem): GraphNodeContentSlotGroup[] {
  let slotGroups: GraphNodeContentSlotGroup[] = [];
  if (Array.isArray(view.children)) {
    const sortedChildren = sortViews(view.children);
    slotGroups = Object.entries(
      groupBy(sortedChildren, (item) => item.mountPoint ?? "")
    ).map(([name, items]) => ({
      name,
      type: isRouteNode(items[0])
        ? "routes"
        : isBrickNode(items[0])
        ? "bricks"
        : "unknown",
      items,
    }));
  }
  return slotGroups;
}

export function getNodeDisplayName(data: ViewItem): string {
  if (data.alias) {
    return data.alias;
  }

  if (data.type === "custom-template") {
    return data.templateId;
  }

  if (isBrickNode(data)) {
    return getBrickName(data);
  }

  return data.path;
}

function getBrickName(data: ViewItem, showFullBrickName?: boolean): string {
  const brickName = data.template || data.brick;
  if (showFullBrickName) {
    return brickName;
  }
  return brickName.split(".").slice(-1)[0];
}

function computeNodeHeight(node: GraphNode): number {
  let height = styleConfig.node.padding * 2 + styleConfig.alias.height;
  if (node.content) {
    switch (node.content.type) {
      case "bricks":
      case "routes":
      case "custom-template":
        height +=
          node.content.items.length * styleConfig.contentItem.height +
          (node.content.items.length - 1) *
            styleConfig.contentItem.marginBottom;
        break;
      case "slots":
        height +=
          node.content.slots.reduce(
            (acc, group) =>
              acc +
              styleConfig.contentDivider.height +
              group.items.length * styleConfig.contentItem.height +
              (group.items.length - 1) * styleConfig.contentItem.marginBottom,
            0
          ) +
          (node.content.slots.length - 1) *
            styleConfig.contentGroup.marginBottom;
        break;
    }
  }
  return height;
}

export function computeSourceX({
  source,
  target,
}: HierarchyPointLink<GraphNode>): number {
  const content = source.data.content;

  if (!content) {
    return source.x;
  }

  let x =
    source.x -
    source.data.height / 2 +
    styleConfig.node.padding +
    styleConfig.alias.height;

  let item: ViewItem;
  let slot: GraphNodeContentSlotGroup;

  switch (content.type) {
    case "bricks":
    case "routes":
    case "custom-template":
      for (item of content.items) {
        if (item === target.data.originalData) {
          return x + styleConfig.contentItem.height / 2;
        }
        x +=
          styleConfig.contentItem.height + styleConfig.contentItem.marginBottom;
      }
      // Should never reach `break`.
      /* istanbul ignore next */
      break;
    case "slots":
      for (slot of content.slots) {
        x += styleConfig.contentDivider.height;
        for (item of slot.items) {
          if (item === target.data.originalData) {
            return x + styleConfig.contentItem.height / 2;
          }
          x +=
            styleConfig.contentItem.height +
            styleConfig.contentItem.marginBottom;
        }
        x -= styleConfig.contentItem.marginBottom;
        x += styleConfig.contentGroup.marginBottom;
      }
      // Should never reach `break`.
      /* istanbul ignore next */
      break;
  }

  return source.x;
}

function sortViews(views: ViewItem[]): ViewItem[] {
  return sortBy(views || [], [(item) => item.sort ?? -Infinity]);
}
