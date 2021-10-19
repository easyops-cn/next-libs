import React, { useState } from "react";
import styles from "./RouteNodeComponent.module.css";
import { ViewItem } from "../shared/interfaces";
import {
  ItemActionsComponent,
  filterActions,
  ContentItemActions,
} from "@next-libs/basic-components";
import classNames from "classnames";
import { RouteTypeIcon } from "./RouteTypeIcon";
import { getViewTypeConfig } from "./processors/getViewTypeConfig";

export interface RouteNodeComponentProps {
  originalData?: ViewItem;
  onNodeClick?: (node: ViewItem) => void;
  contentItemActions?: ContentItemActions;
}

const getPreviewSvg = (data: ViewItem): React.ReactElement => {
  const config = getViewTypeConfig(data?.graphInfo?.viewType);
  return config.component();
};

export function RouteNodeComponent({
  originalData,
  onNodeClick,
  contentItemActions,
}: RouteNodeComponentProps): React.ReactElement {
  const [actionsVisible, setActionsVisible] = useState(false);

  const handleNodeClick = (): void => {
    onNodeClick?.(originalData);
  };

  const handleToolBarClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  const filteredActions = filterActions(contentItemActions, originalData);

  const ellipsisButtonAvailable = filteredActions.length > 0;

  return (
    <div
      className={classNames(styles.routeNodeContainer, {
        [styles.actionsVisible]: actionsVisible,
      })}
      onClick={handleNodeClick}
    >
      <div className={styles.routeNodeInner}>
        <div
          className={classNames(styles.routeTitle, {
            [styles.contentItemEllipsisButtonAvailable]:
              ellipsisButtonAvailable,
          })}
        >
          <RouteTypeIcon
            item={originalData}
            customStyle={{
              verticalAlign: undefined,
              fontSize: "12px",
              marginRight: "6px",
              color: "inherit",
              opacity: 0.8,
            }}
          />
          {originalData.alias ?? originalData.path}
          {ellipsisButtonAvailable && (
            <div
              className={styles.contentItemToolbar}
              onClick={handleToolBarClick}
            >
              <ItemActionsComponent
                filteredActions={filteredActions}
                item={originalData}
                onVisibleChange={(visible: boolean) => {
                  // Wait a macro task to make the dropdown menu disappear smoothly.
                  setTimeout(() => {
                    setActionsVisible(visible);
                  }, 0);
                }}
              />
            </div>
          )}
        </div>
        <div className={styles.preview}>{getPreviewSvg(originalData)}</div>
      </div>
    </div>
  );
}
