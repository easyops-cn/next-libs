import React, { PropsWithChildren, useState, useRef } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { get, isEmpty, isNil } from "lodash";
import { Form } from "@ant-design/compatible";
import { Tooltip } from "antd";
import { GeneralIcon } from "@next-libs/basic-components";
import { BrickAsComponent } from "@next-core/brick-kit";
import { getDefaultMessage } from "./message";
import { ValidationRule } from "@ant-design/compatible/lib/form";
import { ColProps, ColSize } from "antd/lib/grid";
import {
  AbstractGeneralFormElement,
  LabelTooltipProps,
  HelpBrickProps,
  LabelBrick,
} from "./interfaces";
import classNames from "classnames";
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

function isReactElementWithProps(
  node: React.ReactNode
): node is React.ReactElement {
  return (
    typeof node === "object" &&
    !isNil((node as React.ReactElement)?.type) &&
    !isNil((node as React.ReactElement).props)
  );
}

export interface FormItemWrapperProps extends CommonEventProps {
  formElement?: AbstractGeneralFormElement;
  name?: string;
  label?: string;
  labelTooltip?: LabelTooltipProps | string | number;
  labelBrick?: LabelBrick;
  labelColor?: string;
  labelBold?: boolean;
  labelAlign?: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: Record<string, string>;
  autofocus?: boolean;
  validator?:
    | ValidationRule["validator"] // Deprecated
    | Pick<ValidationRule, "validator" | "message">
    | Pick<ValidationRule, "validator" | "message">[];
  helpBrick?: HelpBrickProps | string | number;
  className?: string;
  notRender?: boolean;
  trigger?: string;
  validateTrigger?: string;
  valuePropName?: string;
  asyncForceRerender?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  trim?: boolean; // 为 true 时，会将 trim 后的值作为参数调用 trigger （一般为 onChange）
  trimTrigger?: string;
}

export function getRules(props: FormItemWrapperProps): ValidationRule[] {
  const rules: ValidationRule[] = [];
  ["required", "min", "max", "pattern"].forEach((attr) => {
    const value = props[attr as keyof FormItemWrapperProps];
    if (value) {
      rules.push({
        [attr]: attr === "pattern" ? new RegExp(value as string) : value,
        message: get(props.message, attr, getDefaultMessage(attr, props)),
      });
    }
  });

  if (props.validator) {
    if (Array.isArray(props.validator)) {
      rules.push(...props.validator);
    } else {
      if (typeof props.validator === "function") {
        rules.push({ validator: props.validator });
        // eslint-disable-next-line no-console
        console.warn(
          "Please wrap a validator function with { validator: ValidateFn, message: ... }"
        );
      } else {
        rules.push(props.validator);
      }
    }
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
    "onMouseLeave",
  ];
  const eventMap = {} as any;

  const children = props.children as React.ReactElement;

  supportEvent.forEach((eventName) => {
    const fn = props[eventName as keyof CommonEventProps];

    // 过滤掉子组件存在已绑定的同名事件
    if (fn && !children.props[eventName]) {
      eventMap[eventName] = fn;
    }
  });

  return eventMap;
}

export interface FormItemLayout {
  wrapperCol?: ColProps;
  labelCol?: ColProps;
}

export function addLabelSizeToWrapperOffset(
  wrapperCol: number | string | ColSize,
  labelCol: number | string | ColSize
): ColSize {
  let wrapperSpan: number | string;
  let wrapperOffset: number;

  if (typeof wrapperCol === "number" || typeof wrapperCol === "string") {
    wrapperSpan = wrapperCol;
    wrapperOffset = 0;
  } else {
    wrapperSpan = wrapperCol.span;
    wrapperOffset = +(wrapperCol.offset ?? 0);
  }

  let offset =
    (typeof labelCol === "number" || typeof labelCol === "string"
      ? +labelCol
      : +(labelCol.span ?? 0) + +(labelCol.offset ?? 0)) + wrapperOffset;

  if (+wrapperSpan + offset > 24) {
    offset = wrapperOffset;
  }

  return {
    span: wrapperSpan,
    offset,
  };
}

export function convertLabelSpanToWrapperOffset(
  layout: FormItemLayout
): FormItemLayout {
  const { wrapperCol, labelCol } = layout;
  let convertedLayout: FormItemLayout;

  if (wrapperCol && labelCol) {
    if (wrapperCol.span !== undefined) {
      convertedLayout = {
        wrapperCol: addLabelSizeToWrapperOffset(wrapperCol, labelCol),
      };
    } else {
      const convertedWrapperCol: ColProps = {};
      (
        Object.entries(wrapperCol) as [
          "xs" | "sm" | "md" | "lg" | "xl" | "xxl",
          ColSize
        ][]
      ).forEach(([key, value]) => {
        const labelColSpanOrSize = labelCol[key];

        convertedWrapperCol[key] = labelColSpanOrSize
          ? addLabelSizeToWrapperOffset(value, labelColSpanOrSize)
          : value;
      });

      convertedLayout = {
        wrapperCol: convertedWrapperCol,
      };
    }
  } else {
    convertedLayout = layout;
  }

  return convertedLayout;
}

export function FormItemWrapper(
  props: PropsWithChildren<FormItemWrapperProps>
): React.ReactElement {
  const {
    labelTooltip,
    labelBrick,
    labelBold,
    labelColor,
    labelAlign,
    helpBrick,
    className,
    notRender,
    trigger = "onChange",
    validateTrigger = "onChange",
    valuePropName = "value",
    asyncForceRerender,
    wrapperCol,
    labelCol,
    trim,
    trimTrigger = "onBlur",
  } = props;
  const [, setId] = useState(0);

  if (notRender) {
    return null;
  }

  const eventMap = getCommonEventMap(props);
  let input: React.ReactNode = isEmpty(eventMap)
    ? props.children
    : (React.cloneElement(props.children as React.ReactElement, {
        ...eventMap,
      }) as React.ReactNode);
  const inputType = (input as React.ReactElement)?.type;

  const getLabelTooltipNode = () => {
    if (typeof labelTooltip === "string" || typeof labelTooltip === "number") {
      let title: React.ReactNode = labelTooltip;
      if (typeof labelTooltip === "string" && labelTooltip.includes("\n")) {
        title = labelTooltip
          .split("\n")
          .map((line, index) => <div key={index}>{line}</div>);
      }
      return (
        <Tooltip title={title}>
          <span
            className={classNames(
              style.labelTooltipIcon,
              style.labelTooltipQuestionIcon
            )}
          >
            <GeneralIcon
              icon={{
                lib: "antd",
                icon: "question-circle",
                theme: "filled",
              }}
            />
          </span>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title={labelTooltip.content} overlayStyle={labelTooltip.style}>
          <span
            style={labelTooltip.iconStyle}
            className={style.labelTooltipIcon}
          >
            <GeneralIcon icon={labelTooltip.icon} />
          </span>
        </Tooltip>
      );
    }
  };

  const label =
    labelTooltip || labelBrick?.useBrick ? (
      <span>
        {props.label}
        {labelTooltip && getLabelTooltipNode()}
        {labelBrick?.useBrick && (
          <span
            style={{
              display: "inline-grid",
              gridAutoFlow: "column",
              marginLeft: "2px",
            }}
          >
            <BrickAsComponent useBrick={labelBrick.useBrick} />
          </span>
        )}
      </span>
    ) : labelColor || labelBold ? (
      <span
        style={{
          color: labelColor ?? "var(--antd-label-color)",
          fontWeight: labelBold ? "bold" : "normal",
        }}
      >
        {props.label}
      </span>
    ) : (
      props.label
    );

  const formItemProps: Record<string, any> = {
    label,
    labelAlign,
    labelCol,
    wrapperCol,
  };
  const { formElement } = props;

  if (formElement) {
    if (props.name) {
      const { getFieldDecorator } = formElement.formUtils;
      const rules = getRules(props);

      input = getFieldDecorator(props.name, {
        rules,
        trigger,
        validateTrigger,
        valuePropName,
      })(input);

      if (isReactElementWithProps(input)) {
        let isWrapped = false;

        // ref: https://github.com/react-component/form/pull/468
        if (input.type !== inputType) {
          isWrapped = true;
        }

        let actualInput = isWrapped ? input.props.children : input;
        const originalOnChange = actualInput.props[trigger];

        actualInput = React.cloneElement(actualInput, {
          [trigger]: (...args: any[]) => {
            unstable_batchedUpdates(() => {
              originalOnChange?.(...args);

              // force rerender
              if (asyncForceRerender) {
                Promise.resolve().then(() => {
                  setId((id) => ++id);
                });
              } else {
                setId((id) => ++id);
              }
            });
          },
        });

        input = isWrapped
          ? React.cloneElement(input, { children: actualInput })
          : actualInput;
      }
    }

    if (formElement.layout === "horizontal") {
      const layout =
        labelCol || wrapperCol
          ? {
              labelCol,
              wrapperCol,
            }
          : {
              labelCol: formElement.labelCol,
              wrapperCol: formElement.wrapperCol,
            };

      Object.assign(
        formItemProps,
        label ? layout : convertLabelSpanToWrapperOffset(layout)
      );
    }
    formItemProps.labelAlign = labelAlign ?? props.formElement.labelAlign;
    formItemProps.colon = !props.formElement.noColon;
  }

  if (trim && isReactElementWithProps(input)) {
    let isWrapped = false;

    if (input.type !== inputType) {
      isWrapped = true;
    }

    let actualInput = isWrapped ? input.props.children : input;
    const value = actualInput.props[valuePropName];

    if (typeof value === "string") {
      const originalEventHandler = actualInput.props[trimTrigger];

      actualInput = React.cloneElement(actualInput, {
        [trimTrigger]: (...args: unknown[]) => {
          originalEventHandler?.(...args);
          (actualInput as React.ReactElement).props[trigger](value.trim());
        },
      });

      input = isWrapped
        ? React.cloneElement(input, { children: actualInput })
        : actualInput;
    }
  }

  const getHelpBrickNode = () => {
    if (typeof helpBrick === "string" || typeof helpBrick === "number") {
      return <span className={style.helpInformation}>{helpBrick}</span>;
    }
    if (helpBrick?.useBrick) {
      return (
        <span
          style={helpBrick.containerStyle}
          className={classNames({
            [style.bottomBrick]: ["bottom", undefined].includes(
              helpBrick.placement
            ),
            [style.rightBrick]: helpBrick.placement === "right",
          })}
        >
          <BrickAsComponent useBrick={helpBrick.useBrick} />
        </span>
      );
    }
  };

  return (
    <Form.Item
      className={`${style.formItem} ${className ?? ""}`}
      {...formItemProps}
    >
      {input}
      {getHelpBrickNode()}
    </Form.Item>
  );
}

export function withFormItemWrapper<P>(
  WrappedComponent: React.ComponentType<P>,
  proxyProps?: P
) {
  return function Component(props: P & FormItemWrapperProps) {
    return (
      <FormItemWrapper {...props}>
        <WrappedComponent {...props} {...proxyProps} />
      </FormItemWrapper>
    );
  };
}
