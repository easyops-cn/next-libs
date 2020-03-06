export interface BuilderNode {
  children?: BuilderNode[];
  nodeData?: BuilderItem;
  groupIndex?: number;
}

export interface BuilderItem {
  alias?: string;
  appId?: string;
  id?: string;
  mountPoint?: string;
  sort?: number;
  type?: string;
  children?: BuilderItem[];
}
