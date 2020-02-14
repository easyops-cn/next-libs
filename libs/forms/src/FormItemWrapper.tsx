import React, { PropsWithChildren } from "react";
import { get, isEmpty } from "lodash";
import { Form, Tooltip } from "antd";
import { GeneralIcon } from "@libs/basic-components";
import { getDefaultMessage } from "./message";
import { ValidationRule } from "antd/lib/form";
import { AbstractGeneralFormElement, LabelTooltipProps } from "./interfaces";
import style from "./FormItemWrapper.module.css";
import { addResourceBundle } from "./i18n";
addResourceBundle();

export interface CommonEventProps {
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
  onPressEnter?: (e: KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
}

export interface FormItemWrapperProps extends CommonEventProps {
  formElement?: AbstractGeneralFormElement;
  name?: string;
  label?: string;
  labelTooltip?: LabelTooltipProps;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: Record<string, string>;
  autofocus?: boolean;
  validator?:
    | ValidationRule["validator"]
    | Array<{ validator: ValidationRule["validator"] }>;
}

export function getRules(props: FormItemWrapperProps): ValidationRule[] {
  const rules: ValidationRule[] = [];

  ["required", "min", "max", "pattern"].forEach(attr => {
    const value = props[attr as keyof FormItemWrapperProps];
    if (value) {
      rules.push({
        [attr]: attr === "pattern" ? new RegExp(value as string) : value,
        message: get(props.message, attr, getDefaultMessage(attr, props))
      });
    }
  });

  if (props.validator) {
    Array.isArray(props.validator)
      ? rules.push(...props.validator)
      : rules.push({
          validator: props.validator
        });
  }

  return rules;
}

export function getCommonEventMap(
  props: PropsWithChildren<FormItemWrapperProps>
): CommonEventProps {
  const supportEvent = [
    "onKeyDown",
    "onKeyUp",
    "onFocus",
    "onBlur",
    "onPressEnter",
    "onMouseEnter",
    "onMouseLeave"
  ];
  const eventMap = {} as any;

  const children = props.children as React.ReactElement;

  supportEvent.forEach(eventName => {
    const fn = props[eventName as keyof CommonEventProps];

    // 过滤掉子组件存在已绑定的同名事件
    if (fn && !children.props[eventName]) {
      eventMap[eventName] = fn;
    }
  });

  return eventMap;
}

export function FormItemWrapper(
  props: PropsWithChildren<FormItemWrapperProps>
): React.ReactElement {
  const { labelTooltip } = props;
  const eventMap = getCommonEventMap(props);

  let input = isEmpty(eventMap)
    ? props.children
    : (React.cloneElement(props.children as React.ReactElement, {
        ...eventMap
      }) as React.ReactNode);

  const label = labelTooltip ? (
    <span>
      {props.label}{" "}
      <Tooltip title={labelTooltip.content}>
        <span style={labelTooltip.style}>
          <GeneralIcon icon={labelTooltip.icon} />
        </span>
      </Tooltip>
    </span>
  ) : (
    props.label
  );

  const formItemProps: Record<string, any> = {
    label
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

  return (
    <Form.Item className={style.formItem} {...formItemProps}>
      {input}
    </Form.Item>
  );
}
