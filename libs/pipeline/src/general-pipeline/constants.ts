export const RADIUS = 8;

export type NodeType = {
  x: number;
  y: number;
};

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
