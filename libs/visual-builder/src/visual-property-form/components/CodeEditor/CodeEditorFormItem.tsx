import React, { useState } from "react";
import { some } from "lodash";
import { Form } from "antd";
import { FormItemWrapperProps } from "@next-libs/forms";
import {
  CodeEditorProps,
  CodeEditorItem,
  Error,
} from "@next-libs/code-editor-components";

interface CodeEditorItemProps extends CodeEditorProps, FormItemWrapperProps {}

export function CodeEditorFormItem(
  props: CodeEditorItemProps
): React.ReactElement {
  const { name, label, ...rest } = props;
  const [hasError, setHasError] = useState(false);

  const handleValidate = (err: Error["err"]): void => {
    const error = some(err, ["type", "error"]);
    setHasError(error);
  };

  const validatorFn = async () => {
    if (!hasError) {
      return Promise.resolve();
    } else {
      return Promise.reject("请填写正确的 yaml 语法");
    }
  };

  return (
    <Form.Item
      key={props.name}
      name={props.name}
      label={props.label}
      rules={[
        { required: props.required, message: `请输入${props.name}` },
        { validator: validatorFn },
      ]}
    >
      <CodeEditorItem
        tabSize={2}
        minLines={5}
        maxLines={12}
        printMargin={false}
        showLineNumbers={false}
        theme="tomorrow"
        enableLiveAutocompletion={true}
        onValidate={handleValidate}
        {...rest}
      ></CodeEditorItem>
    </Form.Item>
  );
}
