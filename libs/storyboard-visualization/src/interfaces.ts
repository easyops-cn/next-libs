import { RouteConf, MicroApp, BrickConf } from "@easyops/brick-types";

export type StoryboardTree = StoryboardNodeApp;

export type StoryboardNode =
  | StoryboardNodeApp
  | StoryboardNodeRoute
  | StoryboardNodeBrick
  | StoryboardNodeSlot;

export interface AbstractStoryboardNode {
  type: "app" | "route" | "brick" | "slot";
  slotType?: "routes" | "bricks";
  children?: AbstractStoryboardNode[];
  appData?: MicroApp;
  routeData?: Omit<RouteConf, "bricks">;
  brickData?: BrickConf;
  slotName?: string;
}

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
  children?: StoryboardNodeSlot[];
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
