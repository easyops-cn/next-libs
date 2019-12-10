import { Storyboard, RouteConf, BrickConf } from "@easyops/brick-types";
import {
  ProcessedStoryboard,
  StoryboardNodeRoute,
  StoryboardNodeBrick,
  StoryboardNodeSlot
} from "./interfaces";

export function processStoryboard(storyboard: Storyboard): ProcessedStoryboard {
  return {
    type: "app",
    appData: storyboard.app,
    children: processRoutes(storyboard.routes)
  };
}

function processRoutes(routes: RouteConf[]): StoryboardNodeRoute[] {
  return routes.map(routeConf => {
    const { bricks, ...routeData } = routeConf;
    return {
      type: "route",
      routeData,
      children: processBricks(bricks)
    };
  });
}

function processBricks(bricks: BrickConf[]): StoryboardNodeBrick[] {
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
                  ? processRoutes(slotConf.routes)
                  : processBricks(slotConf.bricks)
            } as StoryboardNodeSlot)
        )
      : undefined
  }));
}
