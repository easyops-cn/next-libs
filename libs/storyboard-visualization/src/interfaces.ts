import { RouteConf, MicroApp, BrickConf } from "@next-core/brick-types";

export type StoryboardTree = StoryboardNodeApp;

export type StoryboardNode =
  | StoryboardNodeApp
  | StoryboardNodeSubRoutes
  | StoryboardNodeSlottedRoutes
  | StoryboardNodeRoutedBrick
  | StoryboardNodeSlottedBrick
  | StoryboardNodeRedirect;

export type RouteData = Omit<RouteConf, "type" | "bricks" | "routes">;
export type BrickData = Omit<BrickConf, "slots">;

export interface AbstractStoryboardNode {
  type: "app" | "routes" | "brick" | "redirect";
  brickType?: "routed" | "slotted";
  routeType?: "routed" | "slotted";
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
  children: StoryboardNodeRoutedChild[];
  appData: MicroApp;
  groupIndex?: number;
  $$originalNode?: StoryboardNodeApp;
}

export type StoryboardNodeRoutedChild =
  | StoryboardNodeSubRoutes
  | StoryboardNodeRoutedBrick
  | StoryboardNodeRedirect;

export interface StoryboardNodeSubRoutes {
  type: "routes";
  routeType: "routed";
  children: StoryboardNodeRoutedChild[];
  routeData: RouteData;
  groupIndex: number;
  $$originalNode?: StoryboardNodeSubRoutes;
}

export interface StoryboardNodeRedirect {
  type: "redirect";
  routeData: RouteData;
  children?: [];
  groupIndex: number;
  $$originalNode?: StoryboardNodeRedirect;
}

export interface StoryboardNodeSlottedRoutes {
  type: "routes";
  routeType: "slotted";
  slotName: string;
  children: StoryboardNodeRoutedChild[];
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
  $$originalNode?: StoryboardNodeBrick;
}

export interface StoryboardNodeRoutedBrick extends StoryboardNodeBaseBrick {
  brickType: "routed";
  routeData: RouteData;
}

export interface StoryboardNodeSlottedBrick extends StoryboardNodeBaseBrick {
  brickType: "slotted";
  slotName: string;
}
