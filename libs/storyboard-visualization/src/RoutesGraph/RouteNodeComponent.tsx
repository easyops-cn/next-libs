import React, { useState } from "react";
import styles from "./RouteNodeComponent.module.css";
import { ViewItem } from "../shared/interfaces";
import { viewTypeConfig } from "./constants";
import { get } from "lodash";
import {
  ItemActionsComponent,
  filterActions,
  ContentItemActions,
} from "@next-libs/basic-components";
import classNames from "classnames";
import { Dropdown, Menu } from "antd";
import { RouteTypeIcon } from "./RouteTypeIcon";

export interface RouteNodeComponentProps {
  originalData?: ViewItem;
  onNodeClick?: (node: ViewItem) => void;
  contentItemActions?: ContentItemActions;
  handleCancelLayout?: (node: ViewItem) => void;
}

const getPreviewSvg = (data: ViewItem): React.ReactElement => {
  const config =
    get(viewTypeConfig, data?.graphInfo?.viewType) ?? viewTypeConfig.default;
  return config.component;
};

export function RouteNodeComponent(
  props: RouteNodeComponentProps
): React.ReactElement {
  const { originalData, onNodeClick, contentItemActions } = props;
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
      <div
        className={classNames(styles.routeTitle, {
          [styles.contentItemEllipsisButtonAvailable]: ellipsisButtonAvailable,
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
                setActionsVisible(visible);
              }}
            />
          </div>
        )}
      </div>
      {getPreviewSvg(originalData)}
    </div>
  );
}
