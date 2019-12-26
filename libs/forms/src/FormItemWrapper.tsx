import React, { PropsWithChildren } from "react";
import { get } from "lodash";
import { Form } from "antd";
import { ValidationRule } from "antd/lib/form";
import { AbstractGeneralFormElement } from "./interfaces";

export interface FormItemWrapperProps {
  formElement?: AbstractGeneralFormElement;
  name?: string;
  label?: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  validator?: (rule: any, value: any, callback: Function) => void;
  message?: Record<string, string>;
  autofocus?: boolean;
}

export function getRules(props: FormItemWrapperProps): ValidationRule[] {
  const rules: ValidationRule[] = [];

  ["required", "min", "max", "pattern", "validator"].forEach(attr => {
    const value = props[attr as keyof FormItemWrapperProps];
    if (value) {
      rules.push({
        [attr]: attr === "pattern" ? new RegExp(value as string) : value,
        message: get(props.message, attr)
      });
    }
  });

  return rules;
}

export function FormItemWrapper(
  props: PropsWithChildren<FormItemWrapperProps>
): React.ReactElement {
  let input = props.children;
  const formItemProps: Record<string, any> = {
    label: props.label
  };
  const { formElement } = props;
  if (formElement) {
    if (props.name) {
      const { getFieldDecorator } = formElement.formUtils;
      const rules = getRules(props);

      input = getFieldDecorator(props.name, {
        rules
      })(input);
    }

    if (formElement.layout === "horizontal") {
      Object.assign(formItemProps, {
        labelCol: formElement.labelCol,
        wrapperCol: formElement.wrapperCol
      });
    }

    formItemProps.colon = !props.formElement.noColon;
  }

  return <Form.Item {...formItemProps}>{input}</Form.Item>;
}
