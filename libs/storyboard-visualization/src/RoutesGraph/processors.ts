import { ViewItem } from "../shared/interfaces";
import { RouteGraphNode, Edge } from "./interfaces";
import { get } from "lodash";
import { viewTypeConfig } from "./constants";
import { linkHorizontal, linkVertical } from "d3-shape";

export function viewsToGraph(views: ViewItem[]): RouteGraphNode[] {
  return views?.map((item, i) => {
    const nodeConfig =
      get(viewTypeConfig, item?.graphInfo?.viewType) ?? viewTypeConfig.default;

    return {
      originalData: item,
      nodeConfig
    };
  });
}

export const linkVerticalFactory = linkVertical<Edge, RouteGraphNode>()
  .x(d => d.linkX)
  .y(d => d.linkY);
export const linkHorizontalFactory = linkHorizontal<Edge, RouteGraphNode>()
  .x(d => d.linkX)
  .y(d => d.linkY);

// TODO(Lynette): 后面再优化下
export function getLinkPath(d: Edge): string {
  const sourceNodeConfig =
    get(viewTypeConfig, d.source.originalData?.graphInfo?.viewType) ??
    viewTypeConfig.default;
  // 宽度固定
  const sourceNodeWidth = 160;
  const targetNodeWidth = 160;
  const sourceNodeHeight = sourceNodeConfig.height + 52;
  const targetNodeConfig =
    get(viewTypeConfig, d.target.originalData?.graphInfo?.viewType) ??
    viewTypeConfig.default;
  const targetNodeHeight = targetNodeConfig.height + 52;
  const [
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    targetX,
    targetY,
    targetWidth,
    targetHeight
  ] = [
    d.source.x,
    d.source.y,
    sourceNodeWidth,
    sourceNodeHeight,
    d.target.x,
    d.target.y,
    targetNodeWidth,
    targetNodeHeight
  ];
  // 默认
  d.source.linkX = sourceX + sourceWidth / 2;
  d.source.linkY = sourceY;
  d.target.linkX = targetX + targetWidth / 2;
  d.target.linkY = targetY;
  // S 高于 T
  if (sourceY + sourceHeight < targetY) {
    d.source.linkY = sourceY + sourceHeight;
    return `${linkVerticalFactory(d)}`;
    // T 高于 S
  } else if (sourceY > targetY + targetHeight) {
    d.target.linkY = targetY + targetHeight;
    return `${linkVerticalFactory(d)}`;
    // S.T 高度重合
  } else if (sourceY + sourceHeight > targetY) {
    // S 在 T 左侧
    if (sourceX + sourceWidth < targetX) {
      d.source.linkX = sourceX + sourceWidth;
      d.source.linkY = sourceY + sourceHeight / 2;
      d.target.linkX = targetX;
      d.target.linkY = targetY + targetHeight / 2;
      return `${linkHorizontalFactory(d)}`;
      // S 在 T 右侧
    } else if (sourceX > targetX + targetWidth) {
      d.source.linkX = sourceX;
      d.source.linkY = sourceY + sourceHeight / 2;
      d.target.linkX = targetX + targetWidth;
      d.target.linkY = targetY + targetHeight / 2;
      return `${linkHorizontalFactory(d)}`;
    }
  }
  return `${linkVerticalFactory(d)}`;
}
