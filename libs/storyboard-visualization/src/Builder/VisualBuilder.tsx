import React from "react";
import { ValueFn } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { BuilderVisualization } from "./BuilderVisualization";
import { BuilderItem, BuilderNode } from "./interfaces";

export interface VisualBuilderProps {
  data: BuilderItem[];
  onNodeClick?: (data: BuilderItem) => void;
  onGroupClick?: (parent: BuilderItem, mountPoint: string) => void;
}

export function VisualBuilder(props: VisualBuilderProps): React.ReactElement {
  const { data, onNodeClick, onGroupClick } = props;

  const visual = React.useMemo(() => new BuilderVisualization(), []);

  const callbackRef = React.useCallback(
    (node: HTMLElement) => {
      if (!node) {
        return;
      }
      node.appendChild(visual.getDOMNode());
    },
    [visual]
  );

  const handleNodeClick: ValueFn<
    SVGPathElement,
    HierarchyPointNode<BuilderNode>,
    void
  > = React.useCallback(
    node => {
      onNodeClick && onNodeClick(node.data.nodeData);
    },
    [onNodeClick]
  );

  const handleGroupClick: ValueFn<
    SVGPathElement,
    HierarchyPointNode<BuilderNode>,
    void
  > = React.useCallback(
    node => {
      onGroupClick &&
        onGroupClick(node.parent.data, node.data.nodeData.mountPoint);
    },
    [onGroupClick]
  );

  const handleRender = React.useCallback(() => {
    visual.render(data, {
      handleNodeClick,
      handleGroupClick
    });
  }, [visual, data, handleNodeClick, handleGroupClick]);

  React.useEffect(() => {
    handleRender();
  }, [handleRender]);

  return (
    <div>
      <div ref={callbackRef} style={{ maxWidth: 1600, margin: "0 auto" }}></div>
    </div>
  );
}
