import { UseBrickConf } from "@easyops/brick-types";
import { ViewItem } from "../shared/interfaces";

export interface GraphNode {
  nodeType: "route" | "brick" | "unknown";
  originalData: ViewItem;
  content?: GraphNodeContent;
  height?: number;
  children?: GraphNode[];
}

export type GraphNodeContent =
  | GraphNodeContentSlots
  | GraphNodeContentBricks
  | GraphNodeContentRoutes
  | GraphNodeContentRedirect
  | GraphNodeContentCustomTemplate;

export interface GraphNodeContentSlots {
  type: "slots";
  slots: GraphNodeContentSlotGroup[];
}

export interface GraphNodeContentSlotGroup {
  name: string;
  type: "bricks" | "routes" | "unknown";
  items: ViewItem[];
}

export interface GraphNodeContentBricks {
  type: "bricks";
  items: ViewItem[];
}

export interface GraphNodeContentRoutes {
  type: "routes";
  items: ViewItem[];
}

export interface GraphNodeContentRedirect {
  type: "redirect";
}

export interface GraphNodeContentCustomTemplate {
  type: "custom-template";
  items: ViewItem[];
}

export interface ContentItemActions {
  useBrick: UseBrickConf;
}
