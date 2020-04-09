export interface ViewItem {
  alias?: string;
  appId?: string;
  id?: string;
  mountPoint?: string;
  sort?: number;
  type?: string;
  brick?: string;
  template?: string;
  path?: string;
  templateId?: string;
  children?: ViewItem[];
  segues?: any; //后面改成string
  viewType?: string; // 看是否放这里还是放object里面
}
