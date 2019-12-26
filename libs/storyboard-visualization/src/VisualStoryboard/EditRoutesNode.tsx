import React from "react";
import { Modal, Form } from "antd";
import {
  StoryboardNodeApp,
  StoryboardNodeSlottedRoutes,
  RouteData
} from "../interfaces";
import { updateRoutesNode, routesNodeChildrenToRoutes } from "./processors";
import { JsonEditor } from "./JsonEditor";

interface EditRoutesNodeProps {
  visible: boolean;
  routesNode: StoryboardNodeApp | StoryboardNodeSlottedRoutes;
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

  const jsonParse = (value: string, label: string): false | RouteData[] => {
    if (!value) {
      return;
    }
    let routes: RouteData[];
    try {
      routes = JSON.parse(value);
    } catch (e) {
      Modal.error({
        content: `请填写有效的${label} JSON 串`
      });
      return false;
    }
    if (!Array.isArray(routes)) {
      Modal.error({
        content: `请填写有效的${label}`
      });
      return false;
    }
    return routes;
  };

  const handleOk = (): void => {
    if (!props.onOk) {
      return;
    }
    const routes = jsonParse(routesAsString, "路由配置");
    if (routes !== false) {
      updateRoutesNode(originalNode, {
        routes
      });
      props.onOk();
    }
  };

  return (
    <Modal
      visible={props.visible}
      onCancel={props.onCancel}
      onOk={handleOk}
      title="编辑路由"
      width={800}
      destroyOnClose={true}
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
            <JsonEditor value={routesAsString} onChange={handleSetRoutes} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
