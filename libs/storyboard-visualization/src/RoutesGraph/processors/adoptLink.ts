import {
  BaseVertex,
  LinkOptions,
  ControlPointPair,
  ControlRect,
} from "../interfaces";
import { getLinkDirection } from "./getLinkDirection";
import { getLinkPath } from "./getLinkPath";

export function adoptLink(
  {
    source,
    target,
    preferDirection,
  }: {
    source: BaseVertex;
    target: BaseVertex;
    preferDirection?: ControlPointPair;
  },
  linkOptions: LinkOptions = {}
): {
  direction?: ControlPointPair;
  path: string;
} {
  const sourceRect = getControlRect(source);
  const targetRect = getControlRect(target);
  const direction = getLinkDirection(
    {
      source: sourceRect,
      target: targetRect,
      preferDirection,
    },
    linkOptions
  );
  return {
    direction,
    path: direction
      ? getLinkPath([sourceRect, targetRect], direction, linkOptions)
      : "",
  };
}

function getControlRect({ top, left, width, height }: BaseVertex): ControlRect {
  const x1 = left + width;
  const y1 = top + height;
  const cx = left + width / 2;
  const cy = top + height / 2;
  return {
    top: [cx, top],
    right: [x1, cy],
    bottom: [cx, y1],
    left: [left, cy],
  };
}
