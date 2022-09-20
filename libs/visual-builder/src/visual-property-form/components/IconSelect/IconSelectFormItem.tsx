import React, { useState } from "react";
import { Form } from "antd";
import { IconSelectProps, IconSelectItem } from "@next-libs/forms";

export function IconSelectFormItem(props: IconSelectProps): React.ReactElement {
  const [visible, setVisible] = useState(false);

  return (
    <Form.Item
      key={props.name}
      name={props.name}
      label={props.label}
      rules={[{ required: props.required, message: `请输入${props.name}` }]}
    >
      <IconSelectItem
        setColor={true}
        bg={true}
        visible={visible}
        openModal={() => setVisible(true)}
        handleCancel={() => setVisible(false)}
        onChange={() => setVisible(false)}
      />
    </Form.Item>
  );
}
