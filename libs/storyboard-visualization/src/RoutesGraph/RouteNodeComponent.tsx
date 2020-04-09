import React from "react";
import styles from "./RouteNodeComponent.module.css";
import { ViewItem } from "../shared/interfaces";
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

export interface RouteNodeComponentProps {
  id?: string;
  originalData?: ViewItem;
}

const getPreviewSvg = (data: ViewItem): React.ReactElement => {
  switch (data.viewType) {
    case "cardList":
      return <CardListSvg />;
    case "dashboard":
      return <DashboardSvg />;
    case "dialog":
      return <DialogSvg />;
    case "drawer":
      return <DrawerSvg />;
    case "form":
      return <FormSvg />;
    case "guide":
      return <GuideSvg />;
    case "kanban":
      return <KanbanSvg />;
    case "menu":
      return <MenuSvg />;
    case "mixed":
      return <MixedSvg />;
    case "subview":
      return <SubviewSvg />;
    case "tableList":
      return <TableListSvg />;
    case "tabs":
      return <TabsSvg />;
    default:
      return <DefaultSvg />;
  }
};

export function RouteNodeComponent(
  props: RouteNodeComponentProps
): React.ReactElement {
  const { originalData } = props;

  return (
    <div className={styles.routeNodeContainer}>
      <div className={styles.routeTitle}>
        {originalData.alias ?? originalData.path}
      </div>
      {getPreviewSvg(originalData)}
      {/* <DashboardSvg /> */}
    </div>
  );
}
