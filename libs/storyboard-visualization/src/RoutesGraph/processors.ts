import { ViewItem } from "../shared/interfaces";
import { GraphNode } from "./interfaces";
import { set, uniqueId } from "lodash";

const mockTarget = {
  "0": [1, 2],
  "1": [3]
};

export function viewsToGraph(views: ViewItem[]): GraphNode[] {
  // console.log(views,'views');
  return views?.map((item, i) => {
    if (mockTarget[i]) {
      mockTarget[i].forEach(target => {
        set(item, `segues.${uniqueId("go-")}.target`, views[target].alias);
      });
    }
    // console.log(item,'item');
    return {
      originalData: item
    };
  });
}
