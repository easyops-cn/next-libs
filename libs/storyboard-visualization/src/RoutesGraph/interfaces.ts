import { ViewItem, SeguesDevConf, SegueDevView } from "../shared/interfaces";

export interface NodeGraphConfig {
  width: number;
  height: number;
}

export interface RouteGraphNode {
  originalData?: ViewItem;
  nodeConfig?: NodeGraphConfig;
  linkX?: number;
  linkY?: number;
  node?: HTMLDivElement;
  x?: number;
  y?: number;
}

export interface Edge {
  source: RouteGraphNode;
  target: RouteGraphNode;
  controls?: ControlPointPair;
}

export type LinkVertex = SnappedLinkVertex | FreeLinkVertex;

export interface SnappedLinkVertex extends BaseVertex, Partial<FreeLinkVertex> {
  node: RouteGraphNode;
  control?: ControlPoint;
}

export interface FreeLinkVertex {
  x: number;
  y: number;
}

export interface BaseVertex {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type ControlPoint = "top" | "right" | "bottom" | "left";
export type ControlPointPair = [source: ControlPoint, target: ControlPoint];
export type ControlRect = Record<ControlPoint, [x: number, y: number]>;

export interface LinkOptions {
  linkOffsetStart?: number;
  linkOffsetEnd?: number;
  cornerRadius?: number;
  sameAxis?: boolean;
}

export interface SegueLinkData {
  source: {
    instanceId: string;
    segues: SeguesDevConf;
  };
  target: {
    alias: string;
  };
  segueId: string;
  _view: SegueDevView;
}

export interface SegueLinkError {
  message: string;
}
