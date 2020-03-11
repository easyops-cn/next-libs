import React from "react";
import { BuilderGraph } from "./BuilderGraph";
import { ViewItem } from "./interfaces";

export interface BuilderGraphComponentProps {
  data: ViewItem[];
  onReorderClick?: (node: ViewItem) => void;
  onNodeClick?: (node: ViewItem) => void;
  onBrickAdd?: (brick: ViewItem) => void;
  onRouteAdd?: (route: ViewItem) => void;
}

export function BuilderGraphComponent(
  props: BuilderGraphComponentProps
): React.ReactElement {
  const { data, onReorderClick, onNodeClick, onBrickAdd, onRouteAdd } = props;

  const visual = React.useMemo(() => new BuilderGraph(), []);

  const callbackRef = React.useCallback(
    (node: HTMLElement) => {
      if (!node) {
        return;
      }
      node.appendChild(visual.getDOMNode());
    },
    [visual]
  );

  const handleRender = React.useCallback(() => {
    visual.render(data, {
      onReorderClick,
      onNodeClick,
      onBrickAdd,
      onRouteAdd
    });
  }, [visual, data, onReorderClick, onNodeClick, onBrickAdd, onRouteAdd]);

  React.useEffect(() => {
    handleRender();
  }, [handleRender]);

  return (
    <div>
      <div ref={callbackRef} style={{ width: "100%", overflowX: "auto" }}></div>
    </div>
  );
}
