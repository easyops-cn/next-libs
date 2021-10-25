import { LinkOptions, ControlPointPair, ControlRect } from "../interfaces";
import { ControlFlags, CoordBit, Coord, Sign, SignBit } from "./ControlFlags";

export function getLinkDirection(
  {
    source,
    target,
    preferDirection,
  }: {
    source: ControlRect;
    target: ControlRect;
    preferDirection?: ControlPointPair;
  },
  {
    linkOffsetStart = 0,
    linkOffsetEnd = 0,
    cornerRadius = 0,
    sameAxis = true,
  }: LinkOptions = {}
): ControlPointPair {
  const linkDirections: ControlPointPair[] = [
    ["bottom", "top"],
    ["right", "left"],
    ["top", "bottom"],
    ["left", "right"],
  ];
  if (!sameAxis) {
    linkDirections.push(
      ["right", "top"],
      ["left", "top"],
      ["top", "left"],
      ["bottom", "left"],
      ["right", "bottom"],
      ["left", "bottom"],
      ["top", "right"],
      ["bottom", "right"]
    );
  }
  let recommended: ControlPointPair;
  for (const direction of linkDirections) {
    const [d0, d1] = direction;
    const [x0, y0] = source[d0];
    const [x1, y1] = target[d1];
    const flag0 = ControlFlags[d0];
    const flag1 = ControlFlags[d1];
    const coord0 = flag0 & CoordBit;
    const coord1 = flag1 & CoordBit;
    const sign0 = (flag0 & SignBit) === Sign.POSITIVE ? 1 : -1;
    const sign1 = (flag1 & SignBit) === Sign.POSITIVE ? 1 : -1;

    const unavailable = [
      [Coord.X, x1 - x0],
      [Coord.Y, y1 - y0],
    ].some(([coord, diff]) => {
      if (coord0 === coord || coord1 === coord) {
        // When the source control is at one coord, there is offset at link start
        // of this coord.
        // And when the target control is at the same coord as the source control,
        // there is an extra offset of the corder radius.
        const offset0 =
          coord0 === coord
            ? sign0 * linkOffsetStart +
              (coord0 === coord1 ? 0 : sign0 * cornerRadius)
            : 0;
        const offset1 = coord1 === coord ? sign1 * linkOffsetEnd : 0;
        const space =
          (diff + offset1 - offset0) * (coord0 === coord ? sign0 : -sign1);
        // If there is not enough space, then this direction is unavailable.
        return space < 0;
      }
    });
    if (unavailable) {
      continue;
    }
    if (!preferDirection) {
      return direction;
    }
    if (d0 === preferDirection[0] && d1 === preferDirection[1]) {
      return direction;
    }
    if (!recommended) {
      recommended = direction;
    }
  }
  return recommended;
}
