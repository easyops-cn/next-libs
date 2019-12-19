import { groupBy } from "lodash";
import {
  Storyboard,
  RouteConf,
  BrickConf,
  SlotsConf
} from "@easyops/brick-types";
import {
  StoryboardTree,
  StoryboardNodeRoutedBrick,
  StoryboardNodeBrickChild,
  StoryboardNodeBrick
} from "./interfaces";

export function treeToStoryboard(tree: StoryboardTree): Storyboard {
  return {
    app: tree.appData,
    routes: processRoutes(tree.children)
  };
}

function processRoutes(nodes: StoryboardNodeRoutedBrick[]): RouteConf[] {
  return Object.values(groupBy(nodes, "groupIndex")).map(nodes => {
    return {
      ...nodes[0].routeData,
      bricks: nodes.map(node => processBrick(node))
    };
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
