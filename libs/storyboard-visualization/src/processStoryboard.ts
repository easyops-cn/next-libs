import { computeRealRoutePath } from "@easyops/brick-utils";
import {
  Storyboard,
  RouteConf,
  BrickConf,
  MicroApp,
  SlotsConf
} from "@easyops/brick-types";
import {
  StoryboardTree,
  StoryboardNodeRoutedBrick,
  StoryboardNodeSlottedBrick,
  RouteData,
  StoryboardNodeBrickChild
} from "./interfaces";

export function processStoryboard(storyboard: Storyboard): StoryboardTree {
  return {
    type: "app",
    appData: storyboard.app,
    children: processRoutes(storyboard.routes, storyboard.app)
  };
}

function processRoutes(
  routes: RouteConf[],
  appData: MicroApp
): StoryboardNodeRoutedBrick[] {
  return routes.reduce<StoryboardNodeRoutedBrick[]>(
    (acc, routeConf, index: number) => {
      const { bricks, ...rest } = routeConf;
      const routeData = {
        ...rest,
        path: computeRealRoutePath(rest.path, appData)
      };
      bricks.forEach(brickConf => {
        acc.push(processRoutedBrick(brickConf, appData, routeData, index));
      });
      return acc;
    },
    []
  );
}

function processBrickChildren(
  slots: SlotsConf,
  appData: MicroApp
): StoryboardNodeBrickChild[] {
  if (!slots) {
    return;
  }
  const children: StoryboardNodeBrickChild[] = [];
  let index = 0;
  for (const [slotName, slotConf] of Object.entries(slots)) {
    if (slotConf.type === "routes") {
      children.push({
        type: "routes",
        slotName,
        groupIndex: index,
        children: processRoutes(slotConf.routes, appData)
      });
    } else {
      for (const brickConf of slotConf.bricks) {
        children.push(processSlottedBrick(brickConf, appData, slotName, index));
      }
    }
    index += 1;
  }
  return children;
}

function processSlottedBrick(
  brickConf: BrickConf,
  appData: MicroApp,
  slotName: string,
  groupIndex: number
): StoryboardNodeSlottedBrick {
  return {
    type: "brick",
    brickType: "slotted",
    brickData: brickConf,
    slotName,
    groupIndex,
    children: processBrickChildren(brickConf.slots, appData)
  };
}

function processRoutedBrick(
  brickConf: BrickConf,
  appData: MicroApp,
  routeData: RouteData,
  groupIndex: number
): StoryboardNodeRoutedBrick {
  return {
    type: "brick",
    brickType: "routed",
    brickData: brickConf,
    routeData,
    groupIndex,
    children: processBrickChildren(brickConf.slots, appData)
  };
}
