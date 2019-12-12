import { RouteConf, MicroApp, BrickConf } from "@easyops/brick-types";

export type ProcessedStoryboard = StoryboardNodeApp;

export type StoryboardNode =
  | StoryboardNodeApp
  | StoryboardNodeRoute
  | StoryboardNodeBrick
  | StoryboardNodeSlot;

export interface StoryboardNodeApp {
  type: "app";
  children: StoryboardNodeRoute[];
  appData: MicroApp;
}

export interface StoryboardNodeRoute {
  type: "route";
  children: StoryboardNodeBrick[];
  routeData: Omit<RouteConf, "bricks">;
}

export interface StoryboardNodeBrick {
  type: "brick";
  children: StoryboardNodeSlot[];
  brickData: BrickConf;
}

export type StoryboardNodeSlot =
  | StoryboardNodeSlotRoutes
  | StoryboardNodeSlotBricks;

export interface StoryboardNodeSlotBase {
  type: "slot";
  slotName: string;
}

export interface StoryboardNodeSlotRoutes extends StoryboardNodeSlotBase {
  slotType: "routes";
  children: StoryboardNodeRoute[];
}

export interface StoryboardNodeSlotBricks extends StoryboardNodeSlotBase {
  slotType: "bricks";
  children: StoryboardNodeBrick[];
}
