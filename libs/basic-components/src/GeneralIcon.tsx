import React from "react";
import { Icon } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MenuIcon,
  RefinedAntdIcon,
  LegacyAntdIcon
} from "@easyops/brick-types";
import { BrickIcon } from "@easyops/brick-icons";

interface MenuIconProps {
  icon: MenuIcon;
}

export function GeneralIcon({ icon }: MenuIconProps): React.ReactElement {
  if (!icon) {
    return <></>;
  }

  const style = icon.color ? { color: icon.color } : {};

  if (icon.lib === "antd") {
    const type =
      (icon as RefinedAntdIcon).icon ?? (icon as LegacyAntdIcon).type;
    return <Icon type={type} theme={icon.theme} style={style} />;
  }

  if (icon.lib === "fa") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const faIcon = icon.prefix ? [icon.prefix, icon.icon] : icon.icon;
    return (
      <Icon style={style} component={() => <FontAwesomeIcon icon={faIcon} />} />
    );
  }

  if (icon.lib === "easyops") {
    return (
      <Icon
        style={style}
        component={() => (
          <BrickIcon icon={icon.icon} category={icon.category} />
        )}
      />
    );
  }

  return <></>;
}
