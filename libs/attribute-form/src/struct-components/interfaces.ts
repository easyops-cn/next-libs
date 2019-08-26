export interface Structkey {
  id: string;
  name: string;
  type: string;
  regex?: any;
  protected?: boolean;
}
export interface AttributeValue {
  default?: any;
  default_type?: string;
  struct_define?: Structkey[];
  type: string;
}
export interface Attribute {
  id?: string;
  name: string;
  protected?: boolean;
  readonly?: string;
  required?: string;
  tag?: string[];
  unique?: string;
  value: AttributeValue;
  wordIndexDenined?: boolean;
  tips?: string;
  description?: string;
}
