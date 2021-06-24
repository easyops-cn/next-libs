import React from "react";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import Icon from "@ant-design/icons";
import { Avatar, AvatarProps } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MenuIcon,
  RefinedAntdIcon,
  LegacyAntdIcon,
  FaIcon,
  EasyopsIcon,
  GradientColor,
} from "@next-core/brick-types";
import { BrickIcon } from "@next-core/brick-icons";
import { Colors, COLORS_MAP, getColor } from "./utils/getColor";
import classnames from "classnames";
import cssStyle from "./GeneralIcon.module.css";
import { uniqueId } from "lodash";

interface MenuIconProps {
  icon: MenuIcon & {
    imgSrc?: string;
    imgStyle?: React.CSSProperties;
  };
  bg?: boolean;
  size?: number | "large" | "small" | "default";
  shape?: "circle" | "square" | "round-square";
  reverseBgColor?: boolean;
  style?: React.CSSProperties;
  onClick?(event: React.MouseEvent<HTMLElement, MouseEvent>): void;
  showEmptyIcon?: boolean;
}

function isGradientColor(
  color: string | GradientColor
): color is GradientColor {
  return (
    color !== undefined &&
    (color as GradientColor)?.startColor !== undefined &&
    (color as GradientColor)?.endColor !== undefined
  );
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
    if (!isGradientColor(icon.color)) {
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
    } else {
      style = {
        color: "transparent",
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

  const generalIconId = uniqueId("generalIcon");

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
        shape={(shape as AvatarProps["shape"]) ?? "circle"}
        style={style}
        className={classnames({
          [cssStyle.roundSquareBg]: shape === "round-square",
        })}
      ></Avatar>
    ) : (
      iconNode
    );
  }

  if (icon.imgSrc) {
    // imgSrc优先级为最高, 如果有imgSrc的存在, 则使用img覆盖其他icon状态
    style.fontSize = 0; // icon居中
    iconNode = (
      <img
        src={icon.imgSrc}
        style={Object.assign(icon.imgStyle ?? {}, {
          display: "inline-block",
        })}
      />
    );
  } else {
    if (icon.lib === "antd") {
      const type =
        (icon as RefinedAntdIcon).icon || (icon as LegacyAntdIcon).type;
      iconNode = (
        <LegacyIcon
          type={type}
          theme={icon.theme}
          style={style}
          onClick={onClick}
          className={generalIconId}
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
          className={generalIconId}
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
          className={generalIconId}
        />
      );
    }
  }

  if (isGradientColor(icon.color)) {
    let gradientIconDirection;
    switch (icon.color?.direction) {
      case "left-to-right":
        gradientIconDirection = { x1: "0", y1: "0", x2: "1", y2: "0" };
        break;
      case "top-to-bottom":
      default:
        gradientIconDirection = { x1: "0", y1: "0", x2: "0", y2: "1" };
    }

    iconNode = (
      <>
        {iconNode}
        <div style={{ position: "absolute" }}>
          <svg width="0" height="0" aria-hidden={true} focusable={false}>
            <defs>
              <linearGradient
                id={`linearGradient-${generalIconId}`}
                {...gradientIconDirection}
              >
                `
                <stop offset="0%" stopColor={icon.color.startColor} />
                <stop offset="100%" stopColor={icon.color.endColor} />
              </linearGradient>
            </defs>
          </svg>
          <style>
            {`.${generalIconId} svg path {
              fill: url(#linearGradient-${generalIconId});
          }`}
          </style>
        </div>
      </>
    );
  }

  if (bg) {
    iconNode = (
      <Avatar
        icon={iconNode}
        size={size ?? "default"}
        shape={(shape as AvatarProps["shape"]) ?? "circle"}
        style={{
          ...(isGradientColor(icon.color) ? { backgroundColor: "#fff" } : {}),
          ...style,
        }}
        className={classnames({
          [cssStyle.roundSquareBg]: shape === "round-square",
        })}
      ></Avatar>
    );
  }

  return iconNode;
}
