import React from "react";
import { Icon, Button } from "antd";
import classNames from "classnames";
import { FaIcon } from "@easyops/brick-types";
import { GeneralIcon } from "@libs/basic-components";
import styles from "./GraphNodeComponent.module.css";
import { GraphNode, ViewItem } from "./interfaces";
import { styleConfig } from "./constants";
import { getNodeDisplayName } from "./processors";

export interface GraphNodeComponentProps {
  node: GraphNode;
  onReorderClick?: (node: ViewItem) => void;
  onNodeClick?: (node: ViewItem) => void;
  onBrickAdd?: (brick: ViewItem) => void;
  onRouteAdd?: (route: ViewItem) => void;
}

export function GraphNodeComponent(
  props: GraphNodeComponentProps
): React.ReactElement {
  const { node, onReorderClick, onNodeClick, onBrickAdd, onRouteAdd } = props;

  /* istanbul ignore next */
  const handleReorderClick = React.useCallback((): void => {
    onReorderClick?.(node);
  }, [onReorderClick, node]);

  let contentComponent: React.ReactNode;
  const content = node.content;

  if (content) {
    switch (content.type) {
      case "bricks":
      case "routes":
        contentComponent = content.items.map((item, index) => (
          <ContentItem
            key={index}
            type={content.type}
            item={item}
            isLast={index === content.items.length - 1}
            onNodeClick={onNodeClick}
            onBrickAdd={onBrickAdd}
            onRouteAdd={onRouteAdd}
          />
        ));
        break;
      case "slots":
        contentComponent = content.slots.map((slot, index) => (
          <div
            key={index}
            className={styles.contentGroup}
            style={{
              ...styleConfig.contentGroup,
              marginBottom:
                index === content.slots.length - 1
                  ? 0
                  : styleConfig.contentGroup.marginBottom
            }}
          >
            <div
              className={styles.contentDivider}
              style={styleConfig.contentDivider}
            >
              {slot.name}
            </div>
            {slot.items.map((subitem, subindex) => (
              <ContentItem
                key={subindex}
                type={slot.type}
                item={subitem}
                isLast={subindex === slot.items.length - 1}
                onNodeClick={onNodeClick}
                onBrickAdd={onBrickAdd}
                onRouteAdd={onRouteAdd}
              />
            ))}
          </div>
        ));
        break;
    }
  }

  return (
    <div
      className={styles.node}
      style={{
        ...styleConfig.node,
        left: -styleConfig.node.width / 2,
        top: -node.height / 2,
        height: node.height
      }}
    >
      <div className={styles.alias} style={styleConfig.alias}>
        {getNodeDisplayName(node.originalData)}
        {node.originalData.type !== "app" && (
          <div className={styles.menuButton} onClick={handleReorderClick}>
            <Icon type="menu" />
          </div>
        )}
      </div>
      {contentComponent}
    </div>
  );
}

interface ContentItemProps {
  type: "bricks" | "routes" | "unknown";
  item: ViewItem;
  isLast?: boolean;
  onNodeClick?: (node: ViewItem) => void;
  onBrickAdd?: (brick: ViewItem) => void;
  onRouteAdd?: (route: ViewItem) => void;
}

type ContentItemSubtype =
  | "route"
  | "brick"
  | "provider"
  | "template"
  | "unknown";

const contentItemSubtypeIconMap: Record<ContentItemSubtype, FaIcon["icon"]> = {
  route: "code-branch",
  brick: "puzzle-piece",
  provider: "database",
  template: "boxes",
  unknown: "question"
};

export function ContentItem(props: ContentItemProps): React.ReactElement {
  const { item, type, isLast, onNodeClick, onBrickAdd, onRouteAdd } = props;

  /* istanbul ignore next */
  const handleNodeClick = React.useCallback((): void => {
    onNodeClick?.(item);
  }, [onNodeClick, item]);

  /* istanbul ignore next */
  const handleBrickAdd = React.useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation();
      onBrickAdd?.(item);
    },
    [onBrickAdd, item]
  );

  /* istanbul ignore next */
  const handleRouteAdd = React.useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation();
      onRouteAdd?.(item);
    },
    [onRouteAdd, item]
  );

  let subtype: ContentItemSubtype = "unknown";
  if (type === "bricks") {
    switch (item.type) {
      case "provider":
      case "template":
        subtype = item.type;
        break;
      default:
        subtype = "brick";
    }
  } else if (type === "routes") {
    subtype = "route";
  }

  const canAddBrick = subtype === "brick" || item.type === "bricks";
  const canAddRoute = subtype === "brick" || item.type === "routes";

  const buttons = Number(canAddBrick) + Number(canAddRoute);

  return (
    <div
      className={classNames(styles.contentItem, {
        [styles.contentItemTypeRoute]: subtype === "route",
        [styles.contentItemTypeBrick]: subtype === "brick",
        [styles.contentItemTypeProvider]: subtype === "provider",
        [styles.contentItemTypeTemplate]: subtype === "template",
        [styles.contentItemToolbarButtons1]: buttons === 1,
        [styles.contentItemToolbarButtons2]: buttons === 2
      })}
      style={{
        ...styleConfig.contentItem,
        marginBottom: isLast ? 0 : styleConfig.contentItem.marginBottom
      }}
      onClick={handleNodeClick}
    >
      <div className={styles.contentItemMain}>
        <span className={styles.contentItemIcon}>
          <GeneralIcon
            icon={{
              lib: "fa",
              icon: contentItemSubtypeIconMap[subtype]
            }}
          />
        </span>
        <span className={styles.contentItemName}>
          {getNodeDisplayName(item)}
        </span>
      </div>
      {buttons > 0 && (
        <div className={styles.contentItemToolbar}>
          {canAddBrick && (
            <Button
              type="link"
              size="small"
              icon="picture"
              onClick={handleBrickAdd}
            />
          )}
          {canAddRoute && (
            <Button
              type="link"
              size="small"
              icon="branches"
              onClick={handleRouteAdd}
            />
          )}
        </div>
      )}
    </div>
  );
}
