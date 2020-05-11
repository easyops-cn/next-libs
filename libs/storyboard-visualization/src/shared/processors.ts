import { checkIfByTransform } from "@easyops/brick-kit";
import { ContentItemActions, ViewItem } from "./interfaces";
import { isObject } from "@easyops/brick-utils";
import { UseBrickConf } from "@easyops/brick-types";

export function filterActions(
  contentItemActions: ContentItemActions,
  item: ViewItem
): UseBrickConf[] {
  const filteredActions = []
    .concat(contentItemActions?.useBrick ?? [])
    .filter((action) => {
      if (isObject(action.if)) {
        // eslint-disable-next-line
        console.warn("Currently resolvable-if in `useBrick` is not supported.");
      }
      return checkIfByTransform(action.if, { item });
    });
  return filteredActions;
}
