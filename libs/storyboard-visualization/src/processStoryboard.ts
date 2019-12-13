import { computeRealRoutePath } from "@easyops/brick-utils";
import {
  Storyboard,
  RouteConf,
  BrickConf,
  MicroApp
} from "@easyops/brick-types";
import {
  StoryboardTree,
  StoryboardNodeRoute,
  StoryboardNodeBrick,
  StoryboardNodeSlot
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
): StoryboardNodeRoute[] {
  return routes.map(routeConf => {
    const { bricks, ...routeData } = routeConf;
    return {
      type: "route",
      routeData: {
        ...routeData,
        path: computeRealRoutePath(routeData.path, appData)
      },
      children: processBricks(bricks, appData)
    };
  });
}

function processBricks(
  bricks: BrickConf[],
  appData: MicroApp
): StoryboardNodeBrick[] {
  return bricks.map(brickConf => ({
    type: "brick",
    brickData: brickConf,
    children: brickConf.slots
      ? Object.entries(brickConf.slots).map(
          ([slotName, slotConf]) =>
            ({
              type: "slot",
              slotName,
              slotType: slotConf.type,
              children:
                slotConf.type === "routes"
                  ? processRoutes(slotConf.routes, appData)
                  : processBricks(slotConf.bricks, appData)
            } as StoryboardNodeSlot)
        )
      : undefined
  }));
}
