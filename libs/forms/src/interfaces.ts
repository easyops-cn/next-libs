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
  labelAlign: string;
}

export type GeneralOption =
  | string
  | number
  | boolean
  | GeneralComplexOption
  | Record<string, any>;

export interface GeneralComplexOption<T = string | number | boolean> {
  label: string;
  caption?: string;
  value: T;
  disabled?: boolean;
}

export interface LabelTooltipProps {
  content: string;
  icon: MenuIcon;
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
