import { ControlPointPair } from "../RoutesGraph/interfaces";

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
  segues?: SeguesDevConf;
  graphInfo?: {
    x?: number;
    y?: number;
    viewType?: string;
  };
  _highlight?: boolean;
}

export interface SeguesDevConf {
  [segueId: string]: SegueDevConf;
}

export interface SegueDevConf {
  target: string;
  _view?: SegueDevView;
}

export interface SegueDevView {
  controls?: ControlPointPair;
}
