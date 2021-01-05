import { ModelObjectAttrValue } from "@sdk/cmdb-sdk/dist/types/model/cmdb";

export interface Structkey {
  id: string;
  name: string;
  type: ModelObjectAttrValue["type"];
  regex?: any;
  protected?: boolean;
}
export interface AttributeValue {
  default?: any;
  default_type?: string;
  struct_define?: Structkey[];
  type: ModelObjectAttrValue["type"];
}
export interface Attribute {
  id?: string;
  name: string;
  protected?: boolean;
  readonly?: "true" | "false";
  required?: "true" | "false";
  tag?: string[];
  unique?: "true" | "false";
  value: AttributeValue;
  wordIndexDenined?: boolean;
  tips?: string;
  description?: string;
}
