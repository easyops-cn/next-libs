export interface BuilderNode {
  nodeData: BuilderItem;
  groupIndex?: number;
  children?: BuilderNode[];
}

export interface BuilderItem {
  alias?: string;
  appId?: string;
  id?: string;
  mountPoint?: string;
  sort?: number;
  type?: string;
  brick?: string;
  template?: string;
  path?: string;
  children?: BuilderItem[];
}
