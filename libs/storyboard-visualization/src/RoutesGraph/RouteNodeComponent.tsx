import React from "react";
import styles from "./RouteNodeComponent.module.css";
import { ViewItem, ContentItemActions } from "../shared/interfaces";
import { viewTypeConfig } from "./constants";
import { get } from "lodash";
import { ItemActionsComponent } from "../components/ItemActionsComponent";
import { filterActions } from "../shared/processors";
import classNames from "classnames";
import { Dropdown, Menu } from "antd";

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

  const handleNodeClick = (): void => {
    onNodeClick?.(originalData);
  };

  const handleToolBarClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  const filteredActions = filterActions(contentItemActions, originalData);

  const ellipsisButtonAvailable = filteredActions.length > 0;

  const menu = (
    <Menu>
      <Menu.Item onClick={(e) => props.handleCancelLayout?.(originalData)}>
        Cancel layout
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["contextMenu"]}>
      <div className={styles.routeNodeContainer} onClick={handleNodeClick}>
        <div
          className={classNames(styles.routeTitle, {
            [styles.contentItemEllipsisButtonAvailable]: ellipsisButtonAvailable,
          })}
        >
          {originalData.alias ?? originalData.path}
          {ellipsisButtonAvailable && (
            <div
              className={styles.contentItemToolbar}
              onClick={handleToolBarClick}
            >
              <ItemActionsComponent
                filteredActions={filteredActions}
                item={originalData}
              />
            </div>
          )}
        </div>
        {getPreviewSvg(originalData)}
      </div>
    </Dropdown>
  );
}
