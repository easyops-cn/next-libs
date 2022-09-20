import { FormInstance } from "antd/lib/form";

export type FormItemType =
  | boolean
  | string
  | string[]
  | number
  | Record<string, any>;

export enum Required {
  True = "true",
  False = "false",
}

export enum ItemModeType {
  Normal = "normal",
  Advanced = "advanced",
}

export interface PropertyType {
  type: FormItemType;
  name: string;
  required?: Required;
  description?: string;
  default?: string;
  group?: string;
  groupI18N?: Record<string, { [language: string]: string }>;
}

export interface UnionPropertyType extends PropertyType {
  mode?: ItemModeType;
  value?: any;
  jsonSchema?: Record<string, any>;
  schemaRef?: string;
}

export type BrickProperties = Record<string, any>;

export interface visualFormUtils extends Partial<FormInstance> {
  resetPropertyFields: (
    typeList: PropertyType[],
    properties: BrickProperties
  ) => void;
  getCurTypeList: () => UnionPropertyType[];
}
