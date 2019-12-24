import React from "react";
import { Modal, Form, Radio, Input } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import { StoryboardNodeBrick } from "../interfaces";
import { updateBrickNode, brickNodeChildrenToSlots } from "./processors";

interface EditBrickNodeProps {
  visible: boolean;
  brickNode: StoryboardNodeBrick;
  onCancel?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onOk?: () => void;
}

type BrickType = "template" | "brick";

export function EditBrickNode(props: EditBrickNodeProps): React.ReactElement {
  const [type, setType] = React.useState<BrickType>("brick");
  const [brickName, setBrickName] = React.useState("");
  const [templateName, setTemplateName] = React.useState("");
  const [propertiesAsString, setPropertiesAsString] = React.useState("");
  const [paramsAsString, setParamsAsString] = React.useState("");
  const [slotsAsString, setSlotsAsString] = React.useState("");

  const originalNode = props.brickNode;

  // Todo(steve): refine tests
  /* istanbul ignore next */
  React.useEffect(() => {
    if (originalNode) {
      const brickData = originalNode.brickData;
      setType(brickData.template ? "template" : "brick");
      setBrickName(brickData.brick);
      setTemplateName(brickData.template);
      setPropertiesAsString(
        JSON.stringify(brickData.properties || undefined, null, 2)
      );
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

  const handleSetProperties = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setPropertiesAsString(e.target.value);
  };

  const handleSetParams = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setParamsAsString(e.target.value);
  };

  const handleSetSlots = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setSlotsAsString(e.target.value);
  };

  const jsonParse = (
    value: string,
    label: string
  ): false | Record<string, any> => {
    if (!value) {
      return;
    }
    let object: Record<any, string>;
    try {
      object = JSON.parse(value);
    } catch (e) {
      Modal.error({
        content: `请填写有效的${label} JSON 串`
      });
      return false;
    }
    if (typeof object !== "object" || Array.isArray(object)) {
      Modal.error({
        content: `请填写有效的${label}`
      });
      return false;
    }
    return object;
  };

  const handleOk = (): void => {
    if (!props.onOk) {
      return;
    }
    const brickData = originalNode.brickData;
    if (type === "brick") {
      const properties = jsonParse(propertiesAsString, "构件属性");
      const slots = jsonParse(slotsAsString, "插槽配置");
      if (properties !== false && slots !== false) {
        updateBrickNode(originalNode, {
          brick: brickName,
          properties,
          slots
        });
        props.onOk();
      }
    } else {
      const params = jsonParse(paramsAsString, "模板参数");
      if (params !== false) {
        delete brickData.brick;
        delete brickData.properties;
        delete originalNode.children;
        Object.assign(brickData, {
          template: templateName,
          params
        });
        props.onOk();
      }
    }
  };

  return (
    <Modal
      visible={props.visible}
      onCancel={props.onCancel}
      onOk={handleOk}
      title="编辑构件"
      width={800}
      destroyOnClose={true}
    >
      {originalNode && (
        <Form>
          <Form.Item label="类型">
            <Radio.Group value={type} onChange={handleSelectType}>
              <Radio value="brick">构件</Radio>
              <Radio value="template">模板</Radio>
            </Radio.Group>
          </Form.Item>
          {type === "brick" ? (
            <React.Fragment key="brick">
              <Form.Item label="构件名">
                <Input value={brickName} onChange={handleSetBrickName} />
              </Form.Item>
              <Form.Item label="构件属性">
                <Input.TextArea
                  value={propertiesAsString}
                  onChange={handleSetProperties}
                  rows={8}
                />
              </Form.Item>
              <Form.Item label="插槽配置">
                <Input.TextArea
                  value={slotsAsString}
                  onChange={handleSetSlots}
                  rows={8}
                />
              </Form.Item>
            </React.Fragment>
          ) : (
            <React.Fragment key="template">
              <Form.Item label="模板名">
                <Input value={templateName} onChange={handleSetTemplateName} />
              </Form.Item>
              <Form.Item label="模板参数">
                <Input.TextArea
                  value={paramsAsString}
                  onChange={handleSetParams}
                  rows={8}
                />
              </Form.Item>
            </React.Fragment>
          )}
        </Form>
      )}
    </Modal>
  );
}
