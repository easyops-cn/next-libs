import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Menu } from "antd";
import { BrickAsComponent } from "@next-core/brick-kit";
import { UseBrickConf } from "@next-core/brick-types";

export interface ItemActionsMenuProps {
  filteredActions: UseBrickConf[];
  visible?: boolean;
  item?: unknown;
  menuPosition?: React.CSSProperties;
  onClick?: (event: React.MouseEvent) => void;
}

export function ItemActionsMenu({
  visible,
  ...restProps
}: ItemActionsMenuProps): React.ReactElement {
  const elem = document.createElement("div");

  useEffect(() => {
    document.body.appendChild(elem);
    return () => {
      document.body.removeChild(elem);
    };
  });

  if (!visible) {
    return null;
  }

  return ReactDOM.createPortal(<LegacyItemActionsMenu {...restProps} />, elem);
}

export function LegacyItemActionsMenu({
  filteredActions,
  item,
  menuPosition,
  onClick,
}: ItemActionsMenuProps): React.ReactElement {
  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 110,
      }}
    >
      <Menu
        prefixCls="ant-dropdown-menu"
        style={{
          width: "fit-content",
          ...menuPosition,
        }}
      >
        {filteredActions.map((action, index) => (
          <Menu.Item key={index}>
            <BrickAsComponent useBrick={action} data={{ item }} />
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
}
