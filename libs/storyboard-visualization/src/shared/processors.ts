import { doTransform } from "@easyops/brick-kit";
import { ContentItemActions, ViewItem } from "./interfaces";
import { isObject } from "@easyops/brick-utils";
import { UseBrickConf } from "@easyops/brick-types";

export function filterActions(
  contentItemActions: ContentItemActions,
  item: ViewItem
): UseBrickConf[] {
  const filteredActions = []
    .concat(contentItemActions?.useBrick ?? [])
    .filter(action => {
      if (isObject(action.if)) {
        // eslint-disable-next-line
        console.warn("Currently don't support resolvable-if in `useBrick`");
      } else if (
        typeof action.if === "boolean" ||
        typeof action.if === "string"
      ) {
        const ifChecked = doTransform({ item }, action.if);
        if (ifChecked === false) {
          return false;
        }
      }
      return true;
    });
  return filteredActions;
}
