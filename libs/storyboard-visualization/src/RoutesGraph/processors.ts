import { ViewItem } from "../shared/interfaces";
import { GraphNode } from "./interfaces";
import { set, uniqueId } from "lodash";

const mockTarget = {
  "0": [1, 2],
  "1": [3]
};

const mockData = {
  0: {
    x: 300,
    y: 10,
    viewType: "dashboard"
  },
  1: {
    x: 150,
    y: 360,
    viewType: "mixed"
  },
  2: {
    x: 450,
    y: 360,
    viewType: "tabs"
  },
  3: {
    x: 300,
    y: 710,
    viewType: "tableList"
  }
};

export function viewsToGraph(views: ViewItem[]): GraphNode[] {
  return views?.map((item, i) => {
    if (mockTarget[i]) {
      mockTarget[i].forEach(target => {
        set(item, `segues.${uniqueId("go-")}.target`, views[target].alias);
      });
    }
    item.x = mockData[i].x;
    item.y = mockData[i].y;
    item.viewType = mockData[i].viewType;
    return {
      originalData: item
    };
  });
}
