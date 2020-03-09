export interface GraphNode {
  nodeType: "route" | "brick" | "unknown";
  originalData: ViewItem;
  content?: GraphNodeContent;
  height?: number;
  children?: GraphNode[];
}

export interface ViewItem {
  alias?: string;
  appId?: string;
  id?: string;
  mountPoint?: string;
  sort?: number;
  type?: string;
  brick?: string;
  template?: string;
  path?: string;
  children?: ViewItem[];
}

export type GraphNodeContent =
  | GraphNodeContentSlots
  | GraphNodeContentBricks
  | GraphNodeContentRoutes
  | GraphNodeContentRedirect;

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
