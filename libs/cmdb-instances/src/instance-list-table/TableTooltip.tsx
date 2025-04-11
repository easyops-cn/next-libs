import React, { useState } from "react";
import { Tooltip } from "antd";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import i18n from "i18next";
import { GeneralIcon } from "@next-libs/basic-components";
import styles from "./TableTooltip.module.css";

interface TableTooltipProps {
  onClick?: () => void;
}
export const TableTooltip = (props: TableTooltipProps): React.ReactElement => {
  const [visible, setVisible] = useState(false);
  const handleClick = (): void => {
    setVisible(false);
    props?.onClick?.();
  };
  return (
    <Tooltip
      title={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.RELATION_INSTANCE_TOOLTIP}`)}
      placement="top"
      visible={visible}
    >
      <GeneralIcon
        icon={{
          lib: "easyops",
          category: "patch-manager",
          icon: "patch-list",
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        iconClassName={styles.relationMoreIcon}
        onClick={handleClick}
      />
    </Tooltip>
  );
};
