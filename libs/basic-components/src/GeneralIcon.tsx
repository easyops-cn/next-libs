import React from "react";
import { Icon, Avatar } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MenuIcon,
  RefinedAntdIcon,
  LegacyAntdIcon,
} from "@easyops/brick-types";
import { BrickIcon } from "@easyops/brick-icons";
import classNames from "classnames";
import styles from "./GeneralIcon.module.css";

interface MenuIconProps {
  icon: MenuIcon;
  bg?: boolean;
  size?: number | "large" | "small" | "default";
  shape?: "circle" | "square";
}

export enum Colors {
  green = "green",
  red = "red",
  blue = "blue",
  orange = "orange",
  cyan = "cyan",
  purple = "purple",
  geekblue = "geekblue",
  gray = "gray",
}

export function GeneralIcon({
  icon,
  bg,
  size,
  shape,
}: MenuIconProps): React.ReactElement {
  let iconNode = <></>;
  if (!icon) {
    return iconNode;
  }

  let iconStyle: Record<string, any> = {};
  let avatarStyle: Record<string, any> = {};
  let iconColorClassName = "";
  if (icon.color) {
    if (bg) {
      if (Object.keys(Colors).includes(icon.color)) {
        iconColorClassName = icon.color;
      } else {
        avatarStyle = {
          color: "#ffffff",
          backgroundColor: icon.color,
        };
      }
    } else {
      iconStyle = { color: icon.color };
    }
  }

  if (icon.lib === "antd") {
    const type =
      (icon as RefinedAntdIcon).icon ?? (icon as LegacyAntdIcon).type;
    iconNode = <Icon type={type} theme={icon.theme} style={iconStyle} />;
  }

  if (icon.lib === "fa") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const faIcon = icon.prefix ? [icon.prefix, icon.icon] : icon.icon;
    iconNode = (
      <Icon
        style={iconStyle}
        component={() => <FontAwesomeIcon icon={faIcon} />}
      />
    );
  }

  if (icon.lib === "easyops") {
    iconNode = (
      <Icon
        style={iconStyle}
        component={() => (
          <BrickIcon icon={icon.icon} category={icon.category} />
        )}
      />
    );
  }

  if (bg) {
    iconNode = (
      <Avatar
        icon={iconNode}
        size={size ?? "default"}
        shape={shape ?? "circle"}
        style={avatarStyle}
        className={classNames(styles[iconColorClassName], {
          [styles.faIcon]: icon.lib === "fa",
        })}
      ></Avatar>
    );
  }

  return iconNode;
}
