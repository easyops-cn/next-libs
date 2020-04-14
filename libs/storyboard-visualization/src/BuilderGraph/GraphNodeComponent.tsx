import React from "react";
import { Icon } from "antd";
import classNames from "classnames";
import { FaIcon } from "@easyops/brick-types";
import { GeneralIcon } from "@libs/basic-components";
import styles from "./GraphNodeComponent.module.css";
import { GraphNode } from "./interfaces";
import { ViewItem, ContentItemActions } from "../shared/interfaces";
import { styleConfig } from "./constants";
import { getNodeDisplayName } from "./processors";
import { ItemActionsComponent } from "../components/ItemActionsComponent";
import { filterActions } from "../shared/processors";

export interface GraphNodeComponentProps {
  node: GraphNode;
  contentItemActions?: ContentItemActions;
  onReorderClick?: (node: ViewItem) => void;
  onNodeClick?: (node: ViewItem) => void;
}

export function GraphNodeComponent(
  props: GraphNodeComponentProps
): React.ReactElement {
  const { node, onReorderClick, onNodeClick, contentItemActions } = props;

  /* istanbul ignore next */
  const handleReorderClick = React.useCallback((): void => {
    onReorderClick?.(node.originalData);
  }, [onReorderClick, node]);

  let contentComponent: React.ReactNode;
  const content = node.content;

  if (content) {
    switch (content.type) {
      case "bricks":
      case "routes":
      case "custom-template":
        contentComponent = content.items.map((item, index) => (
          <ContentItem
            key={index}
            type={content.type}
            item={item}
            isLast={index === content.items.length - 1}
            contentItemActions={contentItemActions}
            onNodeClick={onNodeClick}
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
                contentItemActions={contentItemActions}
                onNodeClick={onNodeClick}
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
        {node.originalData.type !== "app-root" &&
          node.originalData.type !== "tpl-root" && (
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
  type: "bricks" | "routes" | "custom-template" | "unknown";
  item: ViewItem;
  isLast?: boolean;
  contentItemActions?: ContentItemActions;
  onNodeClick?: (node: ViewItem) => void;
}

type ContentItemSubtype =
  | "route"
  | "brick"
  | "provider"
  | "template"
  | "custom-template"
  | "unknown";

const contentItemSubtypeIconMap: Record<ContentItemSubtype, FaIcon["icon"]> = {
  route: "code-branch",
  brick: "puzzle-piece",
  provider: "database",
  template: "boxes",
  "custom-template": "code",
  unknown: "question"
};

export function ContentItem(props: ContentItemProps): React.ReactElement {
  const { item, type, isLast, onNodeClick, contentItemActions } = props;

  /* istanbul ignore next */
  const handleNodeClick = (): void => {
    onNodeClick?.(item);
  };

  /* istanbul ignore next */
  const handleToolBarClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

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
  } else if (type === "custom-template") {
    subtype = type;
  } else if (type === "routes") {
    subtype = "route";
  }

  const filteredActions = filterActions(contentItemActions, item);

  const ellipsisButtonAvailable = filteredActions.length > 0;

  return (
    <div
      className={classNames(styles.contentItem, {
        [styles.contentItemTypeRoute]: subtype === "route",
        [styles.contentItemTypeBrick]: subtype === "brick",
        [styles.contentItemTypeProvider]: subtype === "provider",
        [styles.contentItemTypeTemplate]: subtype === "template",
        [styles.contentItemTypeCustomTemplate]: subtype === "custom-template",
        [styles.contentItemEllipsisButtonAvailable]: ellipsisButtonAvailable
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
      {ellipsisButtonAvailable && (
        <div className={styles.contentItemToolbar} onClick={handleToolBarClick}>
          <ItemActionsComponent filteredActions={filteredActions} item={item} />
        </div>
      )}
    </div>
  );
}
