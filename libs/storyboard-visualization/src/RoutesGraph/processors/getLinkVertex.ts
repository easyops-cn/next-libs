import {
  LinkVertex,
  SnappedLinkVertex,
  ControlPoint,
  RouteGraphNode,
} from "../interfaces";
import { getViewTypeConfig } from "./getViewTypeConfig";

export function getLinkVertex(
  {
    node,
    control,
  }: {
    node: RouteGraphNode;
    control?: ControlPoint;
  },
  padding = 5
): SnappedLinkVertex {
  const { x: left, y: top } = node;
  const { width, height } = getViewTypeConfig(
    node.originalData.graphInfo?.viewType
  );
  return {
    node,
    control,
    top,
    left,
    width,
    height,
    ...(control
      ? {
          x:
            left +
            (control === "top" || control === "bottom"
              ? width / 2
              : control === "left"
              ? padding
              : width - padding),
          y:
            top +
            (control === "left" || control === "right"
              ? height / 2
              : control === "top"
              ? padding
              : height - padding),
        }
      : null),
  };
}

export function isSnapped(link: LinkVertex): link is SnappedLinkVertex {
  return !!(link as SnappedLinkVertex).node;
}
