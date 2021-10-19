import { pointer, select } from "d3-selection";
import { LinkVertex, RouteGraphNode, SnappedLinkVertex } from "../interfaces";
import { getLinkVertex } from "./getLinkVertex";
import { getNearestControlPoint } from "./getNearestControlPoint";
import { lookUpElementUntil } from "./lookUpElementUntil";

export function getTargetVertex({
  event,
  sourceVertex,
  nodeWrapperClassName,
  drawingLinkContainer,
  updateTargetControlPoint,
}: {
  event: {
    sourceEvent: MouseEvent;
  };
  nodeWrapperClassName: string;
  sourceVertex: SnappedLinkVertex;
  drawingLinkContainer: Element;
  updateTargetControlPoint: (node: HTMLElement, control?: string) => void;
}): LinkVertex {
  const wrapper = lookUpElementUntil(
    event.sourceEvent.target as HTMLElement,
    (elem) => elem.classList.contains(nodeWrapperClassName)
  );
  let targetNode: RouteGraphNode;
  if (
    wrapper &&
    (targetNode = select<HTMLElement, RouteGraphNode>(wrapper).datum()) &&
    sourceVertex.node !== targetNode
  ) {
    const [x, y] = pointer(event, wrapper);
    // The wrapper may be transformed, get the rect after transformation.
    const { width, height } = wrapper.getBoundingClientRect();
    const targetControl = getNearestControlPoint({
      x,
      y,
      width,
      height,
    });
    updateTargetControlPoint(wrapper, targetControl);
    return getLinkVertex({
      control: targetControl,
      node: targetNode,
    });
  }
  const [x, y] = pointer(event, drawingLinkContainer);
  return { x, y };
}
