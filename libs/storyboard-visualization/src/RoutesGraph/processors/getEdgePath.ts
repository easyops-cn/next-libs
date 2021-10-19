import { DEFAULT_LINK_OPTIONS } from "../constants";
import { Edge } from "../interfaces";
import { adoptLink } from "./adoptLink";
import { getLinkVertex } from "./getLinkVertex";

export function getEdgePath(edge: Edge): string {
  const sourceVertex = getLinkVertex({
    node: edge.source,
    control: edge.controls?.[0],
  });
  const targetVertex = getLinkVertex({
    node: edge.target,
    control: edge.controls?.[1],
  });
  const { path } = adoptLink(
    {
      source: sourceVertex,
      target: targetVertex,
      preferDirection: edge.controls,
    },
    DEFAULT_LINK_OPTIONS
  );
  return path;
}
