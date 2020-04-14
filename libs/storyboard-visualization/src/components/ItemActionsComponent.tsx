import React from "react";
import { ViewItem } from "../shared/interfaces";
import { Button, Dropdown, Menu } from "antd";
import { BrickAsComponent } from "@easyops/brick-kit";
import { GeneralIcon } from "@libs/basic-components";
import { UseBrickConf } from "@easyops/brick-types";

export interface ItemActionsComponentProps {
  filteredActions?: UseBrickConf[];
  item?: ViewItem;
}

export function ItemActionsComponent(
  props: ItemActionsComponentProps
): React.ReactElement {
  const { item, filteredActions } = props;

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
