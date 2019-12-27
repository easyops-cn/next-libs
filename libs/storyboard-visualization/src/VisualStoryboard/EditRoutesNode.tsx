import React from "react";
import { Modal, Form } from "antd";
import { StoryboardNodeApp, StoryboardNodeSlottedRoutes } from "../interfaces";
import {
  updateRoutesNode,
  routesNodeChildrenToRoutes,
  jsonParse
} from "./processors";
import { JsonEditor } from "./JsonEditor";

interface EditRoutesNodeProps {
  visible: boolean;
  routesNode: StoryboardNodeApp | StoryboardNodeSlottedRoutes;
  editable?: boolean;
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
        originalNode.children
          ? JSON.stringify(
              routesNodeChildrenToRoutes(originalNode.children),
              null,
              2
            )
          : ""
      );
    }
  }, [originalNode]);

  const handleSetRoutes = (value: string): void => {
    setRoutesAsString(value);
  };

  const handleOk = (): void => {
    const routes = jsonParse(routesAsString, "路由配置", "array");
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
    >
      {originalNode && (
        <Form>
          <Form.Item
            label="路由配置"
            extra={
              <div style={{ marginTop: 10 }}>
                <code>&quot;_target&quot;</code> 字段表示已存在的路由目标 ID
              </div>
            }
          >
            <JsonEditor
              value={routesAsString}
              onChange={handleSetRoutes}
              readOnly={!props.editable}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
