import { Path } from "d3-path";

export const RADIUS = 8;

export type NodeType = {
  x: number;
  y: number;
  stageIndex?: number;
  stepIndex?: number;
  element?: HTMLElement;
  key?: string;
  nodeData?: any;
};

export type pathType = {
  path: Path;
  pathElement: SVGPathElement;
  source: NodeType;
  target: NodeType;
};

export type PathData = {
  paths: pathType[];
  d: string;
};

export type RefRepositoryType = Map<
  string,
  {
    element: HTMLElement;
    index: [number, number];
    nodeData: any;
  }
>;

export enum Direction {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL",
}

// Left Bottom Top Right
export enum Position {
  LT = "LT",
  LB = "LB",
  RT = "RT",
  RB = "RB",
  L = "L",
  R = "R",
  B = "B",
  T = "T",
  COINCIDE = "COINCIDE", // 重合
}
