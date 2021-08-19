import React, { useCallback, useState } from "react";
import { Button } from "antd";
import { UseBrickConf } from "@next-core/brick-types";
import { GeneralIcon } from "./GeneralIcon";
import { ItemActionsMenu } from "./ItemActionsMenu";

export interface ItemActionsComponentProps {
  filteredActions?: UseBrickConf[];
  item?: unknown;
  onVisibleChange?: (visible: boolean) => void;
}

export function ItemActionsComponent({
  item,
  filteredActions,
  onVisibleChange,
}: ItemActionsComponentProps): React.ReactElement {
  const [visible, setVisible] = useState(false);
  const [menuPosition, setMenuPosition] = React.useState<React.CSSProperties>();

  const handleTriggerClick = useCallback(
    (event: React.MouseEvent) => {
      setMenuPosition({
        left: event.clientX - 10,
        top: event.clientY + 10,
      });
      setVisible(true);
      onVisibleChange?.(true);
    },
    [onVisibleChange]
  );

  const handleMenuClick = useCallback(() => {
    setVisible(false);
    onVisibleChange?.(false);
  }, [onVisibleChange]);

  if (!filteredActions?.length) {
    return null;
  }

  return (
    <div>
      <Button type="link" size="small" onClick={handleTriggerClick}>
        <GeneralIcon icon={{ lib: "fa", icon: "ellipsis-h" }} />
      </Button>
      <ItemActionsMenu
        visible={visible}
        filteredActions={filteredActions}
        item={item}
        menuPosition={menuPosition}
        onClick={handleMenuClick}
      />
    </div>
  );
}
