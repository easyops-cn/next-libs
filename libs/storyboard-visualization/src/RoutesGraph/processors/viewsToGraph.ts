import { ViewItem } from "../../shared/interfaces";
import { RouteGraphNode } from "../interfaces";
import { getViewTypeConfig } from "./getViewTypeConfig";

export function viewsToGraph(views: ViewItem[]): RouteGraphNode[] {
  return views?.map((item) => {
    const { width, height } = getViewTypeConfig(item.graphInfo?.viewType);
    return {
      originalData: item,
      nodeConfig: {
        width,
        height,
      },
    };
  });
}
