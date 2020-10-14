import React from "react";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import Icon from "@ant-design/icons";
import { Avatar } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MenuIcon,
  RefinedAntdIcon,
  LegacyAntdIcon,
} from "@easyops/brick-types";
import { BrickIcon } from "@easyops/brick-icons";
import { Colors, COLORS_MAP, getColor } from "./utils/getColor";

interface MenuIconProps {
  icon: MenuIcon;
  bg?: boolean;
  size?: number | "large" | "small" | "default";
  shape?: "circle" | "square";
  reverseBgColor?: boolean;
  onClick?(event: React.MouseEvent<HTMLElement, MouseEvent>): void;
}

export function GeneralIcon({
  icon,
  bg,
  size,
  shape,
  reverseBgColor,
  onClick,
}: MenuIconProps): React.ReactElement {
  let iconNode = <></>;
  if (!icon) {
    return bg ? (
      <Avatar
        icon={iconNode}
        size={size ?? "default"}
        shape={shape ?? "circle"}
      ></Avatar>
    ) : (
      iconNode
    );
  }

  let iconStyle: Record<string, any> = {};
  let avatarStyle: Record<string, any> = {};
  if (icon.color) {
    if (bg) {
      if (COLORS_MAP[icon.color as Colors]) {
        if (reverseBgColor) {
          avatarStyle = {
            color: "#ffffff",
            backgroundColor: getColor(icon.color).color,
          };
        } else {
          avatarStyle = getColor(icon.color);
        }
      } else {
        avatarStyle = {
          color: "#ffffff",
          backgroundColor: icon.color,
        };
      }
    } else {
      iconStyle = {
        color: COLORS_MAP[icon.color as Colors]
          ? getColor(icon.color).color
          : icon.color,
      };
    }
  }

  if (icon.lib === "antd") {
    const type =
      (icon as RefinedAntdIcon).icon ?? (icon as LegacyAntdIcon).type;
    iconNode = (
      <LegacyIcon
        type={type}
        theme={icon.theme}
        style={iconStyle}
        onClick={onClick}
      />
    );
  }

  if (icon.lib === "fa") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const faIcon = icon.prefix ? [icon.prefix, icon.icon] : icon.icon;
    iconNode = (
      <Icon
        style={{ ...iconStyle, verticalAlign: 0 }}
        component={() => <FontAwesomeIcon icon={faIcon} />}
        onClick={onClick}
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
        onClick={onClick}
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
      ></Avatar>
    );
  }

  return iconNode;
}
