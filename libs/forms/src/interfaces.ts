import { WrappedFormUtils } from "@ant-design/compatible/lib/form/Form";
import { ColProps } from "antd/lib/col";
import React from "react";
import { MenuIcon, UseBrickConf } from "@next-core/brick-types";

export interface AbstractGeneralFormElement extends HTMLElement {
  formUtils: WrappedFormUtils;
  layout: string;
  noColon: boolean;
  labelCol: ColProps;
  wrapperCol: ColProps;
}

export type GeneralOption =
  | string
  | number
  | boolean
  | GeneralComplexOption
  | Record<string, any>;

export interface GeneralComplexOption<T = string | number | boolean> {
  label: string;
  value: T;
}

export interface LabelTooltipProps {
  content: string;
  icon: MenuIcon;
  popUpType?: "tooltip" | "popover";
  contentType?: "text" | "markdown";
  style?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
}

export interface LabelBrick {
  useBrick: UseBrickConf;
}

export interface HelpBrickProps {
  useBrick: UseBrickConf;
  placement?: "right" | "bottom";
  containerStyle?: React.CSSProperties;
}
