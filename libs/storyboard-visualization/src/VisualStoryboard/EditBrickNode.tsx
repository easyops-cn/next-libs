import React from "react";
import { Modal, Form, Radio, Input } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import { StoryboardNodeBrick } from "../interfaces";
import {
  updateBrickNode,
  brickNodeChildrenToSlots,
  BrickPatch,
  jsonParse
} from "./processors";
import { JsonEditor } from "./JsonEditor";

interface EditBrickNodeProps {
  visible: boolean;
  brickNode: StoryboardNodeBrick;
  editable?: boolean;
  onCancel?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onOk?: () => void;
}

type BrickType = "template" | "brick" | "provider";

export function EditBrickNode(props: EditBrickNodeProps): React.ReactElement {
  const [type, setType] = React.useState<BrickType>("brick");
  const [brickName, setBrickName] = React.useState("");
  const [templateName, setTemplateName] = React.useState("");
  const [propertiesAsString, setPropertiesAsString] = React.useState("");
  const [eventsAsString, setEventsAsString] = React.useState("");
  const [resolvesAsString, setResolvesAsString] = React.useState("");
  const [paramsAsString, setParamsAsString] = React.useState("");
  const [slotsAsString, setSlotsAsString] = React.useState("");

  const originalNode = props.brickNode;

  // Todo(steve): refine tests
  /* istanbul ignore next */
  React.useEffect(() => {
    if (originalNode) {
      const brickData = originalNode.brickData;
      setType(
        brickData.template ? "template" : brickData.bg ? "provider" : "brick"
      );
      setBrickName(brickData.brick);
      setTemplateName(brickData.template);
      if (brickData.properties) {
        setPropertiesAsString(JSON.stringify(brickData.properties, null, 2));
      }
      if (brickData.events) {
        setEventsAsString(JSON.stringify(brickData.events, null, 2));
      }
      if (brickData.lifeCycle && brickData.lifeCycle.useResolves) {
        setResolvesAsString(
          JSON.stringify(brickData.lifeCycle.useResolves, null, 2)
        );
      }
      setParamsAsString(JSON.stringify(brickData.params || undefined, null, 2));
      setSlotsAsString(
        originalNode.children
          ? JSON.stringify(
              brickNodeChildrenToSlots(originalNode.children),
              null,
              2
            )
          : ""
      );
    }
  }, [originalNode]);

  const handleSelectType = (e: RadioChangeEvent): void => {
    setType(e.target.value);
  };

  const handleSetBrickName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setBrickName(e.target.value);
  };

  const handleSetTemplateName = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTemplateName(e.target.value);
  };

  const handleOk = (): void => {
    const brickData = originalNode.brickData;
    if (type === "brick" || type === "provider") {
      const properties = jsonParse(propertiesAsString, "构件属性");
      const events = jsonParse(eventsAsString, "构件事件");
      const resolves = jsonParse(resolvesAsString, "useResolves", "array");
      if (properties !== false && resolves !== false && events !== false) {
        const brickPatch: BrickPatch = {
          brick: brickName,
          properties,
          events,
          lifeCycle: resolves ? { useResolves: resolves } : undefined
        };

        if (type === "brick") {
          const slots = jsonParse(slotsAsString, "插槽配置");
          if (slots !== false) {
            updateBrickNode(originalNode, {
              ...brickPatch,
              slots,
              bg: undefined
            });
            props.onOk && props.onOk();
          }
        } else {
          updateBrickNode(originalNode, {
            ...brickPatch,
            bg: true
          });
          props.onOk && props.onOk();
        }
      }
    } else {
      const params = jsonParse(paramsAsString, "模板参数");
      if (params !== false) {
        delete brickData.brick;
        delete brickData.properties;
        delete brickData.bg;
        delete originalNode.children;
        Object.assign(brickData, {
          template: templateName,
          params
        });
        props.onOk && props.onOk();
      }
    }
  };

  return (
    <Modal
      visible={props.visible}
      onCancel={props.onCancel}
      onOk={handleOk}
      title={props.editable ? "编辑构件" : "查看构件"}
      width={800}
      destroyOnClose={true}
      footer={props.editable ? undefined : null}
      keyboard={!props.editable}
    >
      {originalNode && (
        <Form>
          <Form.Item label="类型">
            <Radio.Group
              value={type}
              onChange={handleSelectType}
              disabled={!props.editable}
            >
              <Radio value="brick">UI 构件</Radio>
              <Radio value="provider">Provider 构件</Radio>
              <Radio value="template">模板</Radio>
            </Radio.Group>
          </Form.Item>
          {type === "brick" || type === "provider" ? (
            <React.Fragment key="brick">
              <Form.Item label="构件名">
                <Input
                  value={brickName}
                  onChange={handleSetBrickName}
                  readOnly={!props.editable}
                />
              </Form.Item>
              <Form.Item label="构件属性">
                <JsonEditor
                  value={propertiesAsString}
                  onChange={setPropertiesAsString}
                  readOnly={!props.editable}
                />
              </Form.Item>
              <Form.Item label="构件事件">
                <JsonEditor
                  value={eventsAsString}
                  onChange={setEventsAsString}
                  readOnly={!props.editable}
                />
              </Form.Item>
              {type === "brick" && (
                <Form.Item
                  label="插槽配置"
                  extra={
                    <div style={{ marginTop: 10 }}>
                      提示：<code>&quot;_target&quot;</code>{" "}
                      字段表示已存在的构件目标 ID
                    </div>
                  }
                >
                  <JsonEditor
                    value={slotsAsString}
                    onChange={setSlotsAsString}
                    readOnly={!props.editable}
                  />
                </Form.Item>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment key="template">
              <Form.Item label="模板名">
                <Input
                  value={templateName}
                  onChange={handleSetTemplateName}
                  readOnly={!props.editable}
                />
              </Form.Item>
              <Form.Item label="模板参数">
                <JsonEditor
                  value={paramsAsString}
                  onChange={setParamsAsString}
                  readOnly={!props.editable}
                />
              </Form.Item>
            </React.Fragment>
          )}
          <Form.Item label="useResolves">
            <JsonEditor
              value={resolvesAsString}
              onChange={setResolvesAsString}
              readOnly={!props.editable}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
