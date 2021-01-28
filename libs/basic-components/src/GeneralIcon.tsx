import React from "react";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import Icon from "@ant-design/icons";
import { Avatar } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MenuIcon,
  RefinedAntdIcon,
  LegacyAntdIcon,
  FaIcon,
  EasyopsIcon,
} from "@next-core/brick-types";
import { BrickIcon } from "@next-core/brick-icons";
import { Colors, COLORS_MAP, getColor } from "./utils/getColor";
import cssStyle from "./GeneralIcon.module.css";

interface MenuIconProps {
  icon: MenuIcon;
  bg?: boolean;
  size?: number | "large" | "small" | "default";
  shape?: "circle" | "square";
  reverseBgColor?: boolean;
  style?: React.CSSProperties;
  onClick?(event: React.MouseEvent<HTMLElement, MouseEvent>): void;
  showEmptyIcon?: boolean;
}

export function GeneralIcon(props: MenuIconProps): React.ReactElement {
  const {
    icon,
    bg,
    size,
    shape,
    reverseBgColor,
    onClick,
    showEmptyIcon,
  } = props;
  let iconNode = <></>;

  let style: Record<string, any>;
  if (icon?.color) {
    if (bg) {
      if (COLORS_MAP[icon.color as Colors]) {
        if (reverseBgColor) {
          style = {
            color: "#ffffff",
            backgroundColor: getColor(icon.color).color,
          };
        } else {
          style = getColor(icon.color);
        }
      } else {
        style = {
          color: "#ffffff",
          backgroundColor: icon.color,
        };
      }
    } else {
      style = {
        color: COLORS_MAP[icon.color as Colors]
          ? getColor(icon.color).color
          : icon.color,
      };
    }
  }
  if (props.style) {
    if (style) {
      Object.assign(style, props.style);
    } else {
      style = props.style;
    }
  }

  const iconType =
    (icon as RefinedAntdIcon | FaIcon | EasyopsIcon)?.icon ||
    (icon as LegacyAntdIcon)?.type;

  if (!icon || (!iconType && showEmptyIcon)) {
    return bg ? (
      <Avatar
        icon={
          showEmptyIcon ? (
            <Icon
              style={style}
              component={() => (
                <BrickIcon icon="empty-icon" category="common" />
              )}
              onClick={onClick}
            />
          ) : (
            iconNode
          )
        }
        size={size ?? "default"}
        shape={shape ?? "circle"}
        style={style}
      ></Avatar>
    ) : (
      iconNode
    );
  }

  if (icon.lib === "antd") {
    const type =
      (icon as RefinedAntdIcon).icon || (icon as LegacyAntdIcon).type;
    iconNode = (
      <LegacyIcon
        type={type}
        theme={icon.theme}
        style={style}
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
        style={{ ...style, verticalAlign: 0 }}
        component={() => (
          <FontAwesomeIcon icon={faIcon} className={cssStyle.faIcon} />
        )}
        onClick={onClick}
      />
    );
  }

  if (icon.lib === "easyops") {
    iconNode = (
      <Icon
        style={style}
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
        style={style}
      ></Avatar>
    );
  }

  return iconNode;
}
