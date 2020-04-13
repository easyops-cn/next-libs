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
  segues?: { [segueId: string]: { target: string } };
  graphInfo?: {
    x?: number;
    y?: number;
    viewType?: string;
  };
}
