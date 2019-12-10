import { WrappedFormUtils } from "antd/lib/form/Form";
import { ColProps } from "antd/lib/col";

export interface AbstractGeneralFormElement extends HTMLElement {
  formUtils: WrappedFormUtils;
  layout: string;
  noColon: boolean;
  labelCol: ColProps;
  wrapperCol: ColProps;
}

export type GeneralOption = string | number | GeneralComplexOption;

export interface GeneralComplexOption<T = string | number> {
  label: string;
  value: T;
}
