import { RouteConf, MicroApp, BrickConf } from "@easyops/brick-types";

export type StoryboardTree = StoryboardNodeApp;

export type StoryboardNode =
  | StoryboardNodeApp
  | StoryboardNodeSlottedRoutes
  | StoryboardNodeRoutedBrick
  | StoryboardNodeSlottedBrick;

export type RouteData = Omit<RouteConf, "bricks">;
export type BrickData = Omit<BrickConf, "slots">;

export interface AbstractStoryboardNode {
  type: "app" | "routes" | "brick";
  brickType?: "routed" | "slotted";
  children?: AbstractStoryboardNode[];
  appData?: MicroApp;
  routeData?: RouteData;
  brickData?: BrickData;
  slotName?: string;
  groupIndex?: number;
  $$originalNode?: AbstractStoryboardNode;
}

export interface StoryboardNodeApp {
  type: "app";
  children: StoryboardNodeRoutedBrick[];
  appData: MicroApp;
  groupIndex?: number;
  $$originalNode?: StoryboardNodeApp;
}

export interface StoryboardNodeSlottedRoutes {
  type: "routes";
  slotName: string;
  children: StoryboardNodeRoutedBrick[];
  groupIndex: number;
  $$originalNode?: StoryboardNodeSlottedRoutes;
}

export type StoryboardNodeBrickChild =
  | StoryboardNodeSlottedRoutes
  | StoryboardNodeSlottedBrick;

export type StoryboardNodeBrick =
  | StoryboardNodeRoutedBrick
  | StoryboardNodeSlottedBrick;

export interface StoryboardNodeBaseBrick {
  type: "brick";
  children?: StoryboardNodeBrickChild[];
  brickData: BrickData;
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
