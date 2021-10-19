import { linkHorizontal, linkVertical } from "d3-shape";
import { ControlPointPair, LinkOptions, ControlRect } from "../interfaces";
import { ControlFlags, CoordBit, Coord, Sign, SignBit } from "./ControlFlags";

const linkVerticalFactory = linkVertical();
const linkHorizontalFactory = linkHorizontal();

export function getLinkPath(
  [sourceRect, targetRect]: [ControlRect, ControlRect],
  [sourceControl, targetControl]: ControlPointPair,
  { linkOffsetStart = 0, linkOffsetEnd = 0, cornerRadius = 0 }: LinkOptions = {}
): string {
  const flag0 = ControlFlags[sourceControl];
  const flag1 = ControlFlags[targetControl];
  const coord0 = flag0 & CoordBit;
  const coord1 = flag1 & CoordBit;
  const sign0 = (flag0 & SignBit) === Sign.POSITIVE ? 1 : -1;
  const sign1 = (flag1 & SignBit) === Sign.POSITIVE ? 1 : -1;
  let [x0, y0] = sourceRect[sourceControl];
  let [x1, y1] = targetRect[targetControl];
  const signedOffsetStart = linkOffsetStart * sign0;
  const signedOffsetEnd = linkOffsetEnd * sign1;
  if (coord0 === Coord.X) {
    x0 += signedOffsetStart;
  } else {
    y0 += signedOffsetStart;
  }
  if (coord1 === Coord.X) {
    x1 += signedOffsetEnd;
  } else {
    y1 += signedOffsetEnd;
  }
  if (coord0 === coord1) {
    return (coord0 === Coord.X ? linkHorizontalFactory : linkVerticalFactory)({
      source: [x0, y0],
      target: [x1, y1],
    });
  }
  let dx: number, dy: number, vPoint: string;
  const sweep = Number(sign0 === sign1) ^ Number(coord0 === Coord.X);
  if (coord0 === Coord.X) {
    dx = cornerRadius * sign0;
    dy = -cornerRadius * sign1;
    vPoint = `H${x1 - dx}`;
  } else {
    dy = cornerRadius * sign0;
    dx = -cornerRadius * sign1;
    vPoint = `V${y1 - dy}`;
  }
  const path: string[] = [
    `M${x0} ${y0}`,
    vPoint,
    `a${cornerRadius} ${cornerRadius} 0 0 ${sweep} ${dx} ${dy}`,
    `L${x1} ${y1}`,
  ];
  return path.join("");
}
