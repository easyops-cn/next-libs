import { groupBy } from "lodash";
import {
  Storyboard,
  RouteConf,
  BrickConf,
  SlotsConf,
  RouteConfOfRedirect
} from "@easyops/brick-types";
import {
  StoryboardTree,
  StoryboardNodeRoutedBrick,
  StoryboardNodeBrickChild,
  StoryboardNodeBrick,
  StoryboardNodeRoutedChild
} from "./interfaces";

export function treeToStoryboard(tree: StoryboardTree): Storyboard {
  return {
    app: tree.appData,
    routes: processRoutes(tree.children)
  };
}

function processRoutes(nodes: StoryboardNodeRoutedChild[]): RouteConf[] {
  return Object.values(groupBy(nodes, "groupIndex")).map(group => {
    const firstNode = group[0];
    if (firstNode.type === "routes") {
      return {
        type: "routes",
        ...firstNode.routeData,
        routes: processRoutes(firstNode.children)
      };
    } else if (firstNode.type === "redirect") {
      return {
        ...firstNode.routeData
      } as RouteConfOfRedirect;
    } else {
      return {
        ...firstNode.routeData,
        bricks: group.map(node =>
          processBrick(node as StoryboardNodeRoutedBrick)
        )
      };
    }
  });
}

function processBrick(node: StoryboardNodeBrick): BrickConf {
  const brickConf: BrickConf = {
    ...node.brickData
  };
  if (node.children && node.children.length > 0) {
    brickConf.slots = processSlots(node.children);
  }
  return brickConf;
}

function processSlots(nodes: StoryboardNodeBrickChild[]): SlotsConf {
  if (!nodes || nodes.length === 0) {
    return undefined;
  }
  return Object.values(groupBy(nodes, "groupIndex")).reduce<SlotsConf>(
    (acc, nodes) => {
      if (nodes[0].type === "routes") {
        acc[nodes[0].slotName] = {
          type: "routes",
          routes: processRoutes(nodes[0].children)
        };
      } else {
        acc[nodes[0].slotName] = {
          type: "bricks",
          bricks: nodes.map(node => processBrick(node as any))
        };
      }
      return acc;
    },
    {}
  );
}
