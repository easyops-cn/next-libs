import { RouteConf, MicroApp, BrickConf } from "@easyops/brick-types";

export type StoryboardTree = StoryboardNodeApp;

export type StoryboardNode =
  | StoryboardNodeApp
  | StoryboardNodeSlottedRoutes
  | StoryboardNodeRoutedBrick
  | StoryboardNodeSlottedBrick;

export type RouteData = Omit<RouteConf, "bricks">;

export interface AbstractStoryboardNode {
  type: "app" | "routes" | "brick";
  brickType?: "routed" | "slotted";
  children?: AbstractStoryboardNode[];
  appData?: MicroApp;
  routeData?: RouteData;
  brickData?: BrickConf;
  slotName?: string;
  groupIndex?: number;
}

export interface StoryboardNodeApp {
  type: "app";
  children: StoryboardNodeRoutedBrick[];
  appData: MicroApp;
  groupIndex?: number;
}

export interface StoryboardNodeSlottedRoutes {
  type: "routes";
  slotName: string;
  children: StoryboardNodeRoutedBrick[];
  groupIndex: number;
}

export type StoryboardNodeBrickChild =
  | StoryboardNodeSlottedRoutes
  | StoryboardNodeSlottedBrick;

export interface StoryboardNodeBaseBrick {
  type: "brick";
  children?: StoryboardNodeBrickChild[];
  brickData: BrickConf;
  groupIndex: number;
}

export interface StoryboardNodeRoutedBrick extends StoryboardNodeBaseBrick {
  brickType: "routed";
  routeData: RouteData;
}

export interface StoryboardNodeSlottedBrick extends StoryboardNodeBaseBrick {
  brickType: "slotted";
  slotName: string;
}
