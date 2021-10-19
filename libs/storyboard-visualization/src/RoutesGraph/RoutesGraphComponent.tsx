import React from "react";
import { RoutesGraph } from "./RoutesGraph";
import { ViewItem } from "../shared/interfaces";
import { ContentItemActions } from "@next-libs/basic-components";
import { viewsToGraph } from "./processors/viewsToGraph";
import { SegueLinkData, SegueLinkError } from "./interfaces";

export interface RoutesGraphComponentProps {
  data?: ViewItem[];
  onNodeClick?: (node: ViewItem) => void;
  onNodeDrag?: (node: ViewItem) => void;
  onSegueLink?: (segue: SegueLinkData) => void;
  onSegueLinkError?: (error: SegueLinkError) => void;
  readOnly?: boolean;
  contentItemActions?: ContentItemActions;
  showReferenceLines?: boolean;
  alignSize?: number;
}

export function RoutesGraphComponent(
  props: RoutesGraphComponentProps
): React.ReactElement {
  const {
    data,
    onNodeClick,
    readOnly,
    onNodeDrag,
    onSegueLink,
    onSegueLinkError,
    contentItemActions,
    showReferenceLines,
    alignSize,
  } = props;

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
      onSegueLink,
      onSegueLinkError,
      contentItemActions,
      showReferenceLines,
      alignSize,
    });
  }, [
    visual,
    data,
    onNodeClick,
    readOnly,
    onNodeDrag,
    onSegueLink,
    onSegueLinkError,
    contentItemActions,
    showReferenceLines,
    alignSize,
  ]);

  React.useEffect(() => {
    handleRender();
  }, [handleRender]);

  return (
    <div>
      <div
        ref={ref}
        style={{
          position: "relative",
        }}
      ></div>
    </div>
  );
}
