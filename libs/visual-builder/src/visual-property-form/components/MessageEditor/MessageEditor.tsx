import { Form, Input, Popover } from "antd";
import React from "react";
import styles from "./MessageEditor.module.css";
import { GeneralIcon } from "@next-libs/basic-components";

interface MessageEditorProps {
  name?: string;
  label?: string | React.ReactElement;
  value?: Record<string, any>;
  required?: boolean;
  onChange?: (data: any) => void;
}

export function MessageEditor({
  name,
  label,
  value = {},
  required,
  onChange,
}: MessageEditorProps): React.ReactElement {
  const renderForm = (value: Record<string, any>) => {
    return (
      <Form
        layout="horizontal"
        labelAlign="left"
        labelCol={{
          style: {
            minWidth: "112px",
          },
        }}
        onValuesChange={onChange}
      >
        <Form.Item name="pattern" label="pattern">
          <Input defaultValue={value.pattern} />
        </Form.Item>
        <Form.Item name="required" label="required">
          <Input defaultValue={value.required} />
        </Form.Item>
        <Form.Item name="max" label="max">
          <Input defaultValue={value.max} />
        </Form.Item>
        <Form.Item name="min" label="min">
          <Input defaultValue={value.min} />
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className={styles.messageEditorContainer}>
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={[{ required: required, message: `请输入${name}` }]}
      >
        <Popover
          overlayStyle={{
            zIndex: 999,
          }}
          content={renderForm(value)}
          title="Detail"
          trigger="click"
          placement="left"
        >
          <div className={styles.editBtn}>
            <GeneralIcon
              icon={{
                lib: "easyops",
                category: "default",
                icon: "edit",
                color: "gray",
              }}
              style={{
                padding: 4,
              }}
            />
          </div>
        </Popover>
      </Form.Item>
    </div>
  );
}
