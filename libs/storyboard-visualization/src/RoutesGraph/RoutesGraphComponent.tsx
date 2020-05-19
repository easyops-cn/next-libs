import React from "react";
import { RoutesGraph } from "./RoutesGraph";
import { ViewItem } from "../shared/interfaces";
import { viewsToGraph } from "./processors";
import { ContentItemActions } from "@libs/basic-components";

export interface RoutesGraphComponentProps {
  data?: ViewItem[];
  onNodeClick?: (node: ViewItem) => void;
  onNodeDrag?: (node: ViewItem) => void;
  readOnly?: boolean;
  contentItemActions?: ContentItemActions;
}

export function RoutesGraphComponent(
  props: RoutesGraphComponentProps
): React.ReactElement {
  const { data, onNodeClick, readOnly, onNodeDrag, contentItemActions } = props;

  const visual = React.useMemo(() => new RoutesGraph(), []);

  const ref = React.useRef<HTMLDivElement>(null);

  const resize = React.useCallback(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    // Make the graph does not overflow the screen.
    const { top, bottom } = node.getBoundingClientRect();
    // The bottom spacing is the height of RootLayout subtract the bottom of the graph.
    const bottomSpacing =
      process.env.NODE_ENV === "test"
        ? 44 // For testing only
        : document.querySelector("#root-layout").getBoundingClientRect()
            .height - bottom;
    const maxHeight =
      document.documentElement.clientHeight - top - bottomSpacing;
    node.style.maxHeight = `${maxHeight}px`;
    node.style.height = `${maxHeight}px`;
  }, []);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    resize();
    node.appendChild(visual.getZoomPanelNode());
    node.appendChild(visual.getRoutesPreviewNode());
    node.appendChild(visual.getDOMNode());
  }, [visual, resize]);

  React.useEffect(() => {
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [resize]);

  const handleRender = React.useCallback(() => {
    visual.render(viewsToGraph(data), {
      readOnly,
      onNodeClick,
      onNodeDrag,
      contentItemActions,
    });
  }, [data, onNodeClick, readOnly, onNodeDrag, contentItemActions]);

  React.useEffect(() => {
    handleRender();
  }, [handleRender]);

  return (
    <div>
      <div
        ref={ref}
        style={{
          width: "100%",
          overflow: "auto",
          display: "grid",
          gridTemplateRows: "max-content",
          gridGap: "10px",
          position: "relative",
        }}
      ></div>
    </div>
  );
}
