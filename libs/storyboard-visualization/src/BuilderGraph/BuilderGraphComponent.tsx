import React from "react";
import { BuilderGraph } from "./BuilderGraph";
import { ViewItem, ContentItemActions } from "./interfaces";

export interface BuilderGraphComponentProps {
  data: ViewItem[];
  contentItemActions?: ContentItemActions;
  onReorderClick?: (node: ViewItem) => void;
  onNodeClick?: (node: ViewItem) => void;
}

export function BuilderGraphComponent(
  props: BuilderGraphComponentProps
): React.ReactElement {
  const { data, contentItemActions, onReorderClick, onNodeClick } = props;

  const visual = React.useMemo(() => new BuilderGraph(), []);

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
  }, []);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    resize();
    node.appendChild(visual.getDOMNode());
  }, [visual, resize]);

  React.useEffect(() => {
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [resize]);

  const handleRender = React.useCallback(() => {
    visual.render(data, {
      contentItemActions,
      onReorderClick,
      onNodeClick
    });
  }, [visual, data, contentItemActions, onReorderClick, onNodeClick]);

  React.useEffect(() => {
    handleRender();
  }, [handleRender]);

  return (
    <div>
      <div ref={ref} style={{ width: "100%", overflow: "auto" }}></div>
    </div>
  );
}
