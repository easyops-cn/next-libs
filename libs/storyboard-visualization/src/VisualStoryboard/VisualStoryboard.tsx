import React from "react";
import { Storyboard } from "@easyops/brick-types";
import { ValueFn } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { EditBrickNode } from "./EditBrickNode";
import { EditRoutesNode } from "./EditRoutesNode";
import { Visualization } from "../Visualization";
import { storyboardToTree } from "../storyboardToTree";
import { filterStoryboardTree } from "../filterStoryboardTree";
import {
  StoryboardNodeBrick,
  StoryboardNodeApp,
  StoryboardNodeSlottedRoutes,
  StoryboardNode,
  StoryboardNodeSubRoutes
} from "../interfaces";
import { treeToStoryboard } from "../treeToStoryboard";

export interface VisualStoryboardProps {
  storyboard: Storyboard;
  path?: string;
  showFullBrickName?: boolean;
  editable?: boolean;
  useYaml?: boolean;
  onStoryboardUpdate?: (value: Storyboard) => void;
}

export function VisualStoryboard(
  props: VisualStoryboardProps
): React.ReactElement {
  const [activeBrickNode, setActiveBrickNode] = React.useState<
    StoryboardNodeBrick
  >(null);
  const [activeRoutesNode, setActiveRoutesNode] = React.useState<
    StoryboardNodeApp | StoryboardNodeSubRoutes | StoryboardNodeSlottedRoutes
  >(null);

  const visual = React.useMemo(() => new Visualization(), []);
  const tree = React.useMemo(() => storyboardToTree(props.storyboard), [
    props.storyboard
  ]);

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
    HierarchyPointNode<StoryboardNode>,
    void
  > = React.useCallback(node => {
    if (node.data.type === "brick") {
      setActiveBrickNode(node.data);
    } else if (node.data.type === "app" || node.data.type === "routes") {
      setActiveRoutesNode(node.data);
    }
  }, []);

  const handleRender = React.useCallback(() => {
    visual.render(
      props.path ? filterStoryboardTree(tree, { path: props.path }) : tree,
      {
        showFullBrickName: props.showFullBrickName,
        handleNodeClick
      }
    );
  }, [props.path, props.showFullBrickName, tree, visual, handleNodeClick]);

  React.useEffect(() => {
    handleRender();
  }, [handleRender]);

  const handleEditBrickNodeCancel = (): void => {
    setActiveBrickNode(null);
  };

  const handleEditBrickNodeOk = (): void => {
    setActiveBrickNode(null);
    handleRender();
    props.onStoryboardUpdate &&
      props.onStoryboardUpdate(treeToStoryboard(tree));
  };

  const handleEditRoutesNodeCancel = (): void => {
    setActiveRoutesNode(null);
  };

  const handleEditRoutesNodeOk = (): void => {
    setActiveRoutesNode(null);
    handleRender();
    props.onStoryboardUpdate &&
      props.onStoryboardUpdate(treeToStoryboard(tree));
  };

  return (
    <>
      <div>
        <div
          ref={callbackRef}
          style={{ maxWidth: 1600, margin: "0 auto" }}
        ></div>
      </div>
      <EditBrickNode
        brickNode={activeBrickNode}
        visible={!!activeBrickNode}
        editable={props.editable}
        useYaml={props.useYaml}
        onCancel={handleEditBrickNodeCancel}
        onOk={handleEditBrickNodeOk}
      />
      <EditRoutesNode
        routesNode={activeRoutesNode}
        visible={!!activeRoutesNode}
        editable={props.editable}
        useYaml={props.useYaml}
        onCancel={handleEditRoutesNodeCancel}
        onOk={handleEditRoutesNodeOk}
      />
    </>
  );
}
