import { MenuIcon } from "@next-core/brick-types";

export interface WorkbenchTreeAction {
  action: string;
  icon: MenuIcon;
  title?: string;
  if?: string | boolean;
}

export interface ActionClickDetail {
  action: string;
  data?: unknown;
}
