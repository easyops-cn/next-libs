import React from "react";
import { Icon } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MenuIcon } from "@easyops/brick-types";
import { BrickIcon } from "@easyops/brick-icons";

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const faIcon = icon.prefix ? [icon.prefix, icon.icon] : icon.icon;
    return <Icon component={() => <FontAwesomeIcon icon={faIcon} />} />;
  }

  if (icon.lib === "easyops") {
    return (
      <Icon
        component={() => (
          <BrickIcon icon={icon.icon} category={icon.category} />
        )}
      />
    );
  }

  return null;
}
