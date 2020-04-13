import React from "react";
import { ViewItem } from "../shared/interfaces";

export interface NodeGraphConfig {
  component?: React.ReactElement;
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
}
