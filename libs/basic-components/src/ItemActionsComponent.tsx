import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { BrickAsComponent } from "@easyops/brick-kit";
import { GeneralIcon } from "./GeneralIcon";
import { UseBrickConf } from "@easyops/brick-types";

export interface ItemActionsComponentProps {
  filteredActions?: UseBrickConf[];
  item?: Record<string, any>;
}

export function ItemActionsComponent(
  props: ItemActionsComponentProps
): React.ReactElement {
  const { item, filteredActions } = props;

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
    >
      <Button type="link" size="small">
        <GeneralIcon icon={{ lib: "fa", icon: "ellipsis-h" }} />
      </Button>
    </Dropdown>
  );
}