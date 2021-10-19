import { Selection } from "d3-selection";
import { LinkVertex, SnappedLinkVertex } from "../interfaces";
import { DEFAULT_LINK_OPTIONS } from "../constants";
import { adoptLink } from "./adoptLink";
import { isSnapped } from "./getLinkVertex";

export function updateDrawingLink({
  sourceVertex,
  targetVertex,
  linkSnappedClassName,
  drawingLink,
  arrowMarkerId,
  drawingArrowMarkerId,
}: {
  sourceVertex: SnappedLinkVertex;
  targetVertex: LinkVertex;
  linkSnappedClassName: string;
  drawingLink: Selection<SVGPathElement, undefined, null, undefined>;
  arrowMarkerId: string;
  drawingArrowMarkerId: string;
}): void {
  if (isSnapped(targetVertex)) {
    const { path } = adoptLink(
      {
        source: sourceVertex,
        target: targetVertex,
        preferDirection: [sourceVertex.control, targetVertex.control],
      },
      DEFAULT_LINK_OPTIONS
    );
    drawingLink.attr("d", path);
    drawingLink.attr("marker-end", `url(#${drawingArrowMarkerId})`);
    drawingLink.classed(linkSnappedClassName, true);
  } else {
    drawingLink.attr(
      "d",
      `M${sourceVertex.x} ${sourceVertex.y}L${targetVertex.x} ${targetVertex.y}`
    );
    drawingLink.attr("marker-end", `url(#${arrowMarkerId})`);
    drawingLink.classed(linkSnappedClassName, false);
  }
}
