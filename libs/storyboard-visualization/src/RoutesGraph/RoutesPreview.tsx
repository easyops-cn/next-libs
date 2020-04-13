import React, { useRef, useState, useEffect } from "react";
import styles from "./RoutesPreview.module.css";
import { RouteNodeComponent } from "./RouteNodeComponent";
import { DndProvider, useDrag, useDragLayer, XYCoord } from "react-dnd";
import HTML5Backend, { getEmptyImage } from "react-dnd-html5-backend";
import { RouteGraphNode } from "./interfaces";

export interface RoutesPreviewProps {
  routes?: RouteGraphNode[];
  onDragEnd?: (value: any, item: RouteGraphNode) => void;
}

const Item = ({
  id,
  children,
  getDraggingStatus
}: {
  id: string;
  children: any;
  getDraggingStatus: (dragging: boolean, currentOffset?: XYCoord) => void;
}): React.ReactElement => {
  const ref = useRef(null);
  const [{ opacity }, drag, preview] = useDrag({
    item: { type: "route-item", id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.5 : 1
    }),
    begin: monitor => {
      getDraggingStatus(true);
    },
    end: (item, monitor) => {
      const currentOffset = monitor.getSourceClientOffset();
      getDraggingStatus(false, currentOffset);
    }
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  drag(ref);
  return (
    <div ref={ref} style={{ opacity }}>
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
      display: "none"
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform
  };
}

const PreviewItem = ({ children }: { children: any }) => {
  const { itemType, isDragging, initialOffset, currentOffset } = useDragLayer(
    monitor => ({
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging()
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
  const { routes } = props;
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

  return (
    <DndProvider backend={HTML5Backend}>
      <PreviewItem>
        {draggingItem && (
          <RouteNodeComponent originalData={draggingItem.originalData} />
        )}
      </PreviewItem>
      {routes?.map(item => {
        return (
          <Item
            key={item.originalData.id}
            id={item.originalData.id}
            getDraggingStatus={(dragging: boolean, currentOffset?: XYCoord) =>
              getDraggingStatus(dragging, item, currentOffset)
            }
          >
            <RouteNodeComponent
              key={item.originalData.id}
              originalData={item.originalData}
            />
          </Item>
        );
      })}
    </DndProvider>
  );
}
