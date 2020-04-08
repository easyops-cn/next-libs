import React from "react";
import { Icon, Button, Dropdown, Menu } from "antd";
import classNames from "classnames";
import { BrickAsComponent, doTransform } from "@easyops/brick-kit";
import { isObject } from "@easyops/brick-utils";
import { FaIcon } from "@easyops/brick-types";
import { GeneralIcon } from "@libs/basic-components";
import styles from "./RouteNodeComponent.module.css";
import { ViewItem } from "../shared/interfaces";
// import { ReactComponent as Dashboard } from "./svg/Dashboard.svg";
import DashboardSvg from "./svg/Dashboard.svg";
// import { styleConfig } from "./constants";
// import { getNodeDisplayName } from "./processors";

// export interface GraphNodeComponentProps {
//   node: GraphNode;
//   contentItemActions?: ContentItemActions;
//   onReorderClick?: (node: ViewItem) => void;
//   onNodeClick?: (node: ViewItem) => void;
// }

export interface RouteNodeComponentProps {
  id?: string;
  originalData?: ViewItem;
}

export function RouteNodeComponent(
  props: RouteNodeComponentProps
): React.ReactElement {
  const { originalData } = props;
  // const { node, onReorderClick, onNodeClick, contentItemActions } = props;

  // /* istanbul ignore next */
  // const handleReorderClick = React.useCallback((): void => {
  //   onReorderClick?.(node.originalData);
  // }, [onReorderClick, node]);

  // let contentComponent: React.ReactNode;
  // const content = node.content;

  // if (content) {
  //   switch (content.type) {
  //     case "bricks":
  //     case "routes":
  //     case "custom-template":
  //       contentComponent = content.items.map((item, index) => (
  //         <ContentItem
  //           key={index}
  //           type={content.type}
  //           item={item}
  //           isLast={index === content.items.length - 1}
  //           contentItemActions={contentItemActions}
  //           onNodeClick={onNodeClick}
  //         />
  //       ));
  //       break;
  //     case "slots":
  //       contentComponent = content.slots.map((slot, index) => (
  //         <div
  //           key={index}
  //           className={styles.contentGroup}
  //           style={{
  //             ...styleConfig.contentGroup,
  //             marginBottom:
  //               index === content.slots.length - 1
  //                 ? 0
  //                 : styleConfig.contentGroup.marginBottom
  //           }}
  //         >
  //           <div
  //             className={styles.contentDivider}
  //             style={styleConfig.contentDivider}
  //           >
  //             {slot.name}
  //           </div>
  //           {slot.items.map((subitem, subindex) => (
  //             <ContentItem
  //               key={subindex}
  //               type={slot.type}
  //               item={subitem}
  //               isLast={subindex === slot.items.length - 1}
  //               contentItemActions={contentItemActions}
  //               onNodeClick={onNodeClick}
  //             />
  //           ))}
  //         </div>
  //       ));
  //       break;
  //   }
  // }

  return (
    <div className={styles.routeNodeContainer}>
      <div className={styles.routeTitle}>
        {originalData.alias ?? originalData.path}
      </div>
      <DashboardSvg />
    </div>
  );
}
