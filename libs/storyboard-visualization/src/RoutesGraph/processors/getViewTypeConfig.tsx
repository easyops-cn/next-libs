import React from "react";
import { hasOwnProperty } from "@next-core/brick-utils";
import { ReactComponent as CardListSvg } from "../svg/CardList.svg";
import { ReactComponent as DashboardSvg } from "../svg/Dashboard.svg";
import { ReactComponent as DefaultSvg } from "../svg/Default.svg";
import { ReactComponent as DialogSvg } from "../svg/Dialog.svg";
import { ReactComponent as DrawerSvg } from "../svg/Drawer.svg";
import { ReactComponent as FormSvg } from "../svg/Form.svg";
import { ReactComponent as GuideSvg } from "../svg/Guide.svg";
import { ReactComponent as KanbanSvg } from "../svg/Kanban.svg";
import { ReactComponent as MenuSvg } from "../svg/Menu.svg";
import { ReactComponent as MixedSvg } from "../svg/Mixed.svg";
import { ReactComponent as SubviewSvg } from "../svg/Subview.svg";
import { ReactComponent as TableListSvg } from "../svg/TableList.svg";
import { ReactComponent as TabsSvg } from "../svg/Tabs.svg";
import { nodeWidth } from "../constants";

const viewTypeConfigMap: Record<
  string,
  {
    // istanbul ignore next
    component(): React.ReactElement;
    width: number;
    height: number;
  }
> = {
  cardList: {
    // istanbul ignore next
    component() {
      return <CardListSvg />;
    },
    width: 121,
    height: 160,
  },
  dashboard: {
    // istanbul ignore next
    component() {
      return <DashboardSvg />;
    },
    width: 121,
    height: 160,
  },
  dialog: {
    // istanbul ignore next
    component() {
      return <DialogSvg />;
    },
    width: 99,
    height: 60,
  },
  drawer: {
    // istanbul ignore next
    component() {
      return <DrawerSvg />;
    },
    width: 79,
    height: 145,
  },
  form: {
    // istanbul ignore next
    component() {
      return <FormSvg />;
    },
    width: 121,
    height: 115,
  },
  guide: {
    // istanbul ignore next
    component() {
      return <GuideSvg />;
    },
    width: 121,
    height: 115,
  },
  kanban: {
    // istanbul ignore next
    component() {
      return <KanbanSvg />;
    },
    width: 121,
    height: 160,
  },
  menu: {
    // istanbul ignore next
    component() {
      return <MenuSvg />;
    },
    width: 37,
    height: 37,
  },
  mixed: {
    // istanbul ignore next
    component() {
      return <MixedSvg />;
    },
    width: 121,
    height: 160,
  },
  subview: {
    // istanbul ignore next
    component() {
      return <SubviewSvg />;
    },
    width: 121,
    height: 115,
  },
  tableList: {
    // istanbul ignore next
    component() {
      return <TableListSvg />;
    },
    width: 121,
    height: 160,
  },
  tabs: {
    // istanbul ignore next
    component() {
      return <TabsSvg />;
    },
    width: 121,
    height: 160,
  },
  default: {
    // istanbul ignore next
    component() {
      return <DefaultSvg />;
    },
    width: 121,
    height: 160,
  },
};

export function getViewTypeConfig(type: string): {
  component(): React.ReactElement;
  width: number;
  height: number;
} {
  const { component, height } =
    viewTypeConfigMap[
      hasOwnProperty(viewTypeConfigMap, type) ? type : "default"
    ];
  return {
    component,
    width: nodeWidth,
    height: height + 48,
  };
}
