import { ControlPoint } from "../interfaces";

/**
 * Use a bit operation to get the nearest control point.
 *
 * When `x * height > y * width`, the control point locates at top-right corner,
 * otherwise it locates at bottom-left corner, which get a bit of `0b01` (1).
 * When `x * height > (height - y) * width`, it locates at bottom-right corner,
 * otherwise it locates at top-left corner, which get a bit of `0b10` (2).
 *
 *   \ <1> /
 *   0\1 0/2
 *     \ /
 * <0>  X  <3>     0: left
 *     / \         1: top
 *   0/2 0\1       2: bottom
 *   / <2> \       3: right
 */
export function getNearestControlPoint({
  x,
  y,
  width,
  height,
}: {
  // Mouse x relative to top-left corner of container.
  x: number;
  // Mouse y relative to top-left corner of container.
  y: number;
  // Container width.
  width: number;
  // Container height.
  height: number;
}): ControlPoint {
  const dir =
    (x * height > y * width ? 1 : 0) |
    (x * height > (height - y) * width ? 2 : 0);
  return (["left", "top", "bottom", "right"] as const)[dir];
}
