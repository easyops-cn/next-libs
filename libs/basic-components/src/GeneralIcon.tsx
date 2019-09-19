import React from "react";
import { Icon } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MenuIcon } from "@easyops/brick-types";

interface MenuIconProps {
  icon: MenuIcon;
}

export function GeneralIcon({ icon }: MenuIconProps): React.ReactElement {
  if (!icon) {
    return null;
  }

  if (icon.lib === "antd") {
    return <Icon type={icon.type} theme={icon.theme} />;
  }

  if (icon.lib === "fa") {
    return <Icon component={() => <FontAwesomeIcon icon={icon.icon} />} />;
  }

  return null;
}
