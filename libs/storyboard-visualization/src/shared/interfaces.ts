import { UseBrickConf } from "@easyops/brick-types";

export interface ViewItem {
  alias?: string;
  appId?: string;
  id?: string;
  instanceId?: string;
  mountPoint?: string;
  sort?: number;
  type?: string;
  redirect?: string;
  brick?: string;
  template?: string;
  path?: string;
  templateId?: string;
  children?: ViewItem[];
  segues?: { [segueId: string]: { target: string } };
  graphInfo?: {
    x?: number;
    y?: number;
    viewType?: string;
  };
  _highlight?: boolean;
}
