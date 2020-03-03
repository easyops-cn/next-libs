import { WrappedFormUtils } from "antd/lib/form/Form";
import { ColProps } from "antd/lib/col";
import React from "react";
import { MenuIcon, UseBrickConf } from "@easyops/brick-types";

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
  | GeneralComplexOption
  | Record<string, any>;

export interface GeneralComplexOption<T = string | number> {
  label: string;
  value: T;
}

export interface LabelTooltipProps {
  content: string;
  icon: MenuIcon;
  style?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
}

export interface HelpBrickProps {
  useBrick: UseBrickConf;
  Placement?: "right" | "bottom";
  containerStyle?: React.CSSProperties;
}
