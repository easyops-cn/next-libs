import { groupBy } from "lodash";
import {
  StoryboardNodeBrick,
  StoryboardNodeBrickChild,
  StoryboardNodeRoutedBrick,
  StoryboardNodeSlottedBrick,
  RouteData,
  StoryboardNodeApp,
  StoryboardNodeSlottedRoutes
} from "../interfaces";

interface BrickPatch {
  brick: string;
  properties: Record<string, any>;
  slots: SlotsData;
}

interface SlotsData {
  [slotName: string]: SlotData;
}

interface SlotData {
  type: "routes" | "bricks";
}

interface RouteDataPatch extends RouteData {
  _target?: number;
}

interface RoutesPatch {
  routes: RouteDataPatch[];
}

export function brickNodeChildrenToSlots(
  nodes: StoryboardNodeBrickChild[]
): SlotsData {
  return Object.values(groupBy(nodes, "groupIndex")).reduce<SlotsData>(
    (acc, nodes) => {
      if (nodes[0].type === "routes") {
        acc[nodes[0].slotName] = {
          type: "routes"
        };
      } else {
        acc[nodes[0].slotName] = {
          type: "bricks"
        };
      }
      return acc;
    },
    {}
  );
}

export function updateBrickNode(
  node: StoryboardNodeBrick,
  patch: BrickPatch
): void {
  const brickData = node.brickData;
  const { slots, ...rest } = patch;
  Object.assign(brickData, rest);
  delete brickData.template;
  delete brickData.params;
  if (!slots) {
    delete node.children;
    return;
  }
  const children: StoryboardNodeBrickChild[] = [];
  let index = 0;
  for (const [slotName, slotData] of Object.entries(slots)) {
    const matchedChildren = node.children.filter(
      item =>
        item.type === (slotData.type === "routes" ? "routes" : "brick") &&
        item.slotName === slotName
    );
    if (matchedChildren.length > 0) {
      children.push(
        ...matchedChildren.map(item => ({
          ...item,
          groupIndex: index
        }))
      );
    } else {
      if (slotData.type === "routes") {
        children.push({
          type: "routes",
          slotName,
          groupIndex: index,
          children: []
        });
      } else {
        children.push({
          type: "brick",
          brickType: "slotted",
          slotName,
          groupIndex: index,
          brickData: {
            brick: "div"
          }
        } as StoryboardNodeSlottedBrick);
      }
    }
    index += 1;
  }
  node.children = children;
}

export function routesNodeChildrenToRoutes(
  nodes: StoryboardNodeRoutedBrick[]
): RouteDataPatch[] {
  return Object.values(groupBy(nodes, "groupIndex")).map(group => ({
    _target: group[0].groupIndex,
    ...group[0].routeData
  }));
}

export function updateRoutesNode(
  node: StoryboardNodeApp | StoryboardNodeSlottedRoutes,
  patch: RoutesPatch
): void {
  node.children = patch.routes.reduce<StoryboardNodeRoutedBrick[]>(
    (acc, routeDataPatch, index) => {
      const { _target, ...routeData } = routeDataPatch;
      const matchedChildren =
        _target !== undefined &&
        node.children.filter(item => item.groupIndex === _target);
      if (matchedChildren && matchedChildren.length > 0) {
        acc.push(
          ...matchedChildren.map(item => ({
            ...item,
            routeData,
            groupIndex: index
          }))
        );
      } else {
        acc.push({
          type: "brick",
          brickType: "routed",
          routeData,
          brickData: {
            brick: "div"
          },
          groupIndex: index
        } as StoryboardNodeRoutedBrick);
      }
      return acc;
    },
    []
  );
}
