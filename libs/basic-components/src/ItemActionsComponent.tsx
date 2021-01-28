import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { BrickAsComponent } from "@next-core/brick-kit";
import { GeneralIcon } from "./GeneralIcon";
import { UseBrickConf } from "@next-core/brick-types";

export interface ItemActionsComponentProps {
  filteredActions?: UseBrickConf[];
  item?: Record<string, any>;
  onVisibleChange?(visible: boolean): void;
}

export function ItemActionsComponent(
  props: ItemActionsComponentProps
): React.ReactElement {
  const { item, filteredActions, onVisibleChange } = props;

  if (!filteredActions?.length) {
    return null;
  }

  return (
    <Dropdown
      trigger={["click"]}
      overlay={
        <Menu>
          {filteredActions.map((action, index) => (
            <Menu.Item key={index}>
              <BrickAsComponent useBrick={action} data={{ item }} />
            </Menu.Item>
          ))}
        </Menu>
      }
      onVisibleChange={onVisibleChange}
    >
      <Button type="link" size="small">
        <GeneralIcon icon={{ lib: "fa", icon: "ellipsis-h" }} />
      </Button>
    </Dropdown>
  );
}
