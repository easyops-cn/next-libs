import React from "react";
import CardListSvg from "./svg/CardList.svg";
import DashboardSvg from "./svg/Dashboard.svg";
import DefaultSvg from "./svg/Default.svg";
import DialogSvg from "./svg/Dialog.svg";
import DrawerSvg from "./svg/Drawer.svg";
import FormSvg from "./svg/Form.svg";
import GuideSvg from "./svg/Guide.svg";
import KanbanSvg from "./svg/Kanban.svg";
import MenuSvg from "./svg/Menu.svg";
import MixedSvg from "./svg/Mixed.svg";
import SubviewSvg from "./svg/Subview.svg";
import TableListSvg from "./svg/TableList.svg";
import TabsSvg from "./svg/Tabs.svg";

export const viewTypeConfig: Record<
  string,
  {
    component: React.ReactElement;
    width: number;
    height: number;
  }
> = {
  cardList: {
    component: <CardListSvg />,
    width: 121,
    height: 160,
  },
  dashboard: {
    component: <DashboardSvg />,
    width: 121,
    height: 160,
  },
  dialog: {
    component: <DialogSvg />,
    width: 99,
    height: 60,
  },
  drawer: {
    component: <DrawerSvg />,
    width: 79,
    height: 145,
  },
  form: {
    component: <FormSvg />,
    width: 121,
    height: 115,
  },
  guide: {
    component: <GuideSvg />,
    width: 121,
    height: 115,
  },
  kanban: {
    component: <KanbanSvg />,
    width: 121,
    height: 160,
  },
  menu: {
    component: <MenuSvg />,
    width: 37,
    height: 37,
  },
  mixed: {
    component: <MixedSvg />,
    width: 121,
    height: 160,
  },
  subview: {
    component: <SubviewSvg />,
    width: 121,
    height: 115,
  },
  tableList: {
    component: <TableListSvg />,
    width: 121,
    height: 160,
  },
  tabs: {
    component: <TabsSvg />,
    width: 121,
    height: 160,
  },
  default: {
    component: <DefaultSvg />,
    width: 121,
    height: 160,
  },
};

export const nodeWidth = 160;

export const ZOOM_STEP = 0.05;
export const ZOOM_SCALE_MIN = 0.5;
export const ZOOM_SCALE_MAX = 1.5;
