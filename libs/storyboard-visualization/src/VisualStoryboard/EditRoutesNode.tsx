import React from "react";
import { Modal, Form } from "antd";
import {
  StoryboardNodeApp,
  StoryboardNodeSlottedRoutes,
  StoryboardNodeSubRoutes
} from "../interfaces";
import {
  updateRoutesNode,
  routesNodeChildrenToRoutes,
  generalParse,
  generalStringify
} from "./processors";
import { GeneralEditor } from "./GeneralEditor";

interface EditRoutesNodeProps {
  visible: boolean;
  routesNode:
    | StoryboardNodeApp
    | StoryboardNodeSubRoutes
    | StoryboardNodeSlottedRoutes;
  editable?: boolean;
  useYaml?: boolean;
  onCancel?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onOk?: () => void;
}

export function EditRoutesNode(props: EditRoutesNodeProps): React.ReactElement {
  const [routesAsString, setRoutesAsString] = React.useState("");

  const originalNode =
    props.routesNode && props.routesNode.$$originalNode
      ? props.routesNode.$$originalNode
      : props.routesNode;

  // Todo(steve): refine tests
  /* istanbul ignore next */
  React.useEffect(() => {
    if (originalNode) {
      setRoutesAsString(
        generalStringify(
          originalNode.children &&
            routesNodeChildrenToRoutes(originalNode.children),
          props.useYaml
        )
      );
    }
  }, [originalNode, props.useYaml]);

  const handleSetRoutes = (value: string): void => {
    setRoutesAsString(value);
  };

  const handleOk = (): void => {
    const routes = generalParse(
      routesAsString,
      "路由配置",
      props.useYaml,
      "array"
    );
    if (routes !== false) {
      updateRoutesNode(originalNode, {
        routes
      });
      props.onOk && props.onOk();
    }
  };

  return (
    <Modal
      visible={props.visible}
      onCancel={props.onCancel}
      onOk={handleOk}
      title={props.editable ? "编辑路由" : "查看路由"}
      width={800}
      destroyOnClose={true}
      footer={props.editable ? undefined : null}
      keyboard={!props.editable}
    >
      {originalNode && (
        <Form>
          <Form.Item
            label="路由配置"
            extra={
              <div style={{ marginTop: 10 }}>
                提示：<code>&quot;_target&quot;</code> 字段表示已存在的路由目标
                ID
              </div>
            }
          >
            <GeneralEditor
              value={routesAsString}
              useYaml={props.useYaml}
              onChange={handleSetRoutes}
              readOnly={!props.editable}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
