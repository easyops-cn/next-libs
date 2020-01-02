import React from "react";
import { Modal, Form, Radio, Input } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import { StoryboardNodeBrick } from "../interfaces";
import {
  updateBrickNode,
  brickNodeChildrenToSlots,
  BrickPatch,
  generalParse,
  generalStringify
} from "./processors";
import { GeneralEditor } from "./GeneralEditor";

interface EditBrickNodeProps {
  visible: boolean;
  brickNode: StoryboardNodeBrick;
  editable?: boolean;
  useYaml?: boolean;
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
      setPropertiesAsString(
        generalStringify(brickData.properties, props.useYaml)
      );
      setEventsAsString(generalStringify(brickData.events, props.useYaml));
      setResolvesAsString(
        generalStringify(
          brickData.lifeCycle && brickData.lifeCycle.useResolves,
          props.useYaml
        )
      );
      setParamsAsString(generalStringify(brickData.params, props.useYaml));
      setSlotsAsString(
        generalStringify(
          originalNode.children &&
            brickNodeChildrenToSlots(originalNode.children),
          props.useYaml
        )
      );
    }
  }, [originalNode, props.useYaml]);

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
      const properties = generalParse(
        propertiesAsString,
        "构件属性",
        props.useYaml
      );
      const events = generalParse(eventsAsString, "构件事件", props.useYaml);
      const resolves = generalParse(
        resolvesAsString,
        "useResolves",
        props.useYaml,
        "array"
      );
      if (properties !== false && resolves !== false && events !== false) {
        const brickPatch: BrickPatch = {
          brick: brickName,
          properties,
          events,
          lifeCycle: resolves ? { useResolves: resolves } : undefined
        };

        if (type === "brick") {
          const slots = generalParse(slotsAsString, "插槽配置", props.useYaml);
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
      const params = generalParse(paramsAsString, "模板参数", props.useYaml);
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
                <GeneralEditor
                  value={propertiesAsString}
                  useYaml={props.useYaml}
                  onChange={setPropertiesAsString}
                  readOnly={!props.editable}
                />
              </Form.Item>
              <Form.Item label="构件事件">
                <GeneralEditor
                  value={eventsAsString}
                  useYaml={props.useYaml}
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
                  <GeneralEditor
                    value={slotsAsString}
                    useYaml={props.useYaml}
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
                <GeneralEditor
                  value={paramsAsString}
                  useYaml={props.useYaml}
                  onChange={setParamsAsString}
                  readOnly={!props.editable}
                />
              </Form.Item>
            </React.Fragment>
          )}
          <Form.Item label="useResolves">
            <GeneralEditor
              value={resolvesAsString}
              useYaml={props.useYaml}
              onChange={setResolvesAsString}
              readOnly={!props.editable}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
