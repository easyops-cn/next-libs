import { looseCheckIfByTransform } from "@next-core/brick-kit";
import { UseBrickConf } from "@next-core/brick-types";

export interface ContentItemActions {
  useBrick: UseBrickConf;
}

// 配合 ItemActionsComponent 一起使用
export function filterActions(
  contentItemActions: ContentItemActions,
  item: unknown
): UseBrickConf[] {
  const filteredActions = []
    .concat(contentItemActions?.useBrick ?? [])
    .filter((action) => looseCheckIfByTransform(action, { item }));
  return filteredActions;
}
