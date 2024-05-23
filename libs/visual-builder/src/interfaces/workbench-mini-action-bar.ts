import { MenuIcon, UseBrickConf } from "@next-core/brick-types";

export interface WorkbenchTreeAction {
  action: string;
  icon: MenuIcon;
  title?: string;
  if?: string | boolean;
  iconUseBrick?: {
    useBrick: UseBrickConf;
  };
}

export interface ActionClickDetail {
  action: string;
  data?: unknown;
  clientX: number;
  clientY?: number;
}
