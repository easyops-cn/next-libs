import React, { useRef, useState, useEffect } from "react";
import styles from "./RoutesPreview.module.css";
import { RouteNodeComponent } from "./RouteNodeComponent";
import { DndProvider, useDrag, useDragLayer, XYCoord } from "react-dnd";
import HTML5Backend, { getEmptyImage } from "react-dnd-html5-backend";
import { RouteGraphNode } from "./interfaces";
import { ViewItem, ContentItemActions } from "../shared/interfaces";
import { ItemActionsComponent } from "../components/ItemActionsComponent";
import { filterActions } from "../shared/processors";
import classNames from "classnames";

export interface RoutesPreviewProps {
  routes?: RouteGraphNode[];
  onDragEnd?: (value: any, item: RouteGraphNode) => void;
  onNodeClick?: (node: ViewItem) => void;
  readOnly?: boolean;
  contentItemActions?: ContentItemActions;
}

const Item = ({
  id,
  children,
  getDraggingStatus,
  readOnly,
}: {
  id: string;
  children: any;
  getDraggingStatus: (dragging: boolean, currentOffset?: XYCoord) => void;
  readOnly: boolean;
}): React.ReactElement => {
  const ref = useRef(null);
  const [{ opacity }, drag, preview] = useDrag({
    item: { type: "route-item", id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
    begin: (monitor) => {
      getDraggingStatus(true);
    },
    end: (item, monitor) => {
      const currentOffset = monitor.getSourceClientOffset();
      getDraggingStatus(false, currentOffset);
    },
    canDrag: () => {
      return !readOnly;
    },
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  drag(ref);
  return (
    <div ref={ref} style={{ opacity }} className={styles.item}>
      {children}
    </div>
  );
};

function getPreviewItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

const PreviewItem = ({ children }: { children: any }) => {
  const { itemType, isDragging, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  return (
    <div className={styles.previewItem}>
      <div style={getPreviewItemStyles(initialOffset, currentOffset)}>
        <div>{children}</div>
      </div>
    </div>
  );
};

export function RoutesPreview(props: RoutesPreviewProps): React.ReactElement {
  const { routes, onNodeClick, readOnly, contentItemActions } = props;
  const [draggingItem, setDraggingItem] = useState<
    RouteGraphNode | undefined
  >();

  const getDraggingStatus = (
    dragging: boolean,
    item: RouteGraphNode,
    currentOffset: XYCoord
  ): void => {
    const resultItem: RouteGraphNode | undefined = dragging ? item : null;
    setDraggingItem(resultItem);
    if (currentOffset && !dragging) {
      props.onDragEnd && props.onDragEnd(currentOffset, item);
    }
  };

  const handleClick = (value: ViewItem) => {
    onNodeClick?.(value);
  };

  const handleToolBarClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <PreviewItem>
        {draggingItem && (
          <RouteNodeComponent originalData={draggingItem.originalData} />
        )}
      </PreviewItem>
      {routes?.map((item) => {
        const filteredActions = filterActions(
          contentItemActions,
          item.originalData
        );
        const ellipsisButtonAvailable = filteredActions.length > 0;
        return (
          <Item
            key={item.originalData.id}
            id={item.originalData.id}
            getDraggingStatus={(dragging: boolean, currentOffset?: XYCoord) =>
              getDraggingStatus(dragging, item, currentOffset)
            }
            readOnly={readOnly}
          >
            <span
              key={item.originalData.id}
              onClick={() => handleClick(item.originalData)}
              className={classNames(styles.previewTag, {
                [styles.contentItemEllipsisButtonAvailable]: ellipsisButtonAvailable,
              })}
            >
              {item.originalData.alias ?? item.originalData.path}
              {ellipsisButtonAvailable && (
                <div
                  className={styles.contentItemToolbar}
                  onClick={handleToolBarClick}
                >
                  <ItemActionsComponent
                    filteredActions={filteredActions}
                    item={item.originalData}
                  />
                </div>
              )}
            </span>
          </Item>
        );
      })}
    </DndProvider>
  );
}
