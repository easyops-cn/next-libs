import React, { useMemo, useRef } from "react";
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
import { isEqual, uniqueId } from "lodash";

type SrcIcon = {
  imgSrc?: string;
  imgStyle?: React.CSSProperties;
};

interface MenuIconProps {
  icon: MenuIcon | SrcIcon;
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

export function GeneralIcon({
  icon: _icon,
  bg,
  size,
  shape,
  reverseBgColor,
  onClick,
  showEmptyIcon,
  style,
}: MenuIconProps): React.ReactElement {
  const memoizedIcon = useDeepEqualMemo(_icon);
  const getStyle = (icon: MenuIcon): React.CSSProperties => {
    let mergedStyle: React.CSSProperties;
    if (icon?.color) {
      if (!isGradientColor(icon.color)) {
        if (bg) {
          if (COLORS_MAP[icon.color as Colors]) {
            if (reverseBgColor) {
              mergedStyle = {
                color: "#ffffff",
                backgroundColor: getColor(icon.color).color,
              };
            } else {
              mergedStyle = getColor(icon.color);
            }
          } else {
            mergedStyle = {
              color: "#ffffff",
              backgroundColor: icon.color,
            };
          }
        } else {
          mergedStyle = {
            color: COLORS_MAP[icon.color as Colors]
              ? getColor(icon.color).color
              : icon.color,
          };
        }
      } else {
        mergedStyle = {
          color: "transparent",
        };
      }
    }
    return mergedStyle;
  };
  const getDefaultIcon = (
    bg: boolean,
    mergedStyle: React.CSSProperties,
    iconNode: JSX.Element
  ) => {
    return bg ? (
      <Avatar
        icon={
          showEmptyIcon ? (
            <Icon
              style={mergedStyle}
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
        style={mergedStyle}
        className={classnames({
          [cssStyle.roundSquareBg]: shape === "round-square",
        })}
      ></Avatar>
    ) : (
      iconNode
    );
  };

  return useMemo(() => {
    let iconNode = <></>;
    let icon = memoizedIcon;
    if (typeof icon === "number" || typeof icon === "string") return iconNode;
    if (!icon) icon = {};
    let mergedStyle: React.CSSProperties;

    if ("imgSrc" in icon) {
      iconNode = (
        <img
          src={icon.imgSrc}
          width={size}
          height={size}
          style={icon.imgStyle}
          onClick={onClick}
        />
      );
    } else if ("lib" in icon) {
      mergedStyle = getStyle(icon);

      if (style) {
        if (mergedStyle) {
          Object.assign(mergedStyle, style);
        } else {
          mergedStyle = style;
        }
      }

      const generalIconId = uniqueId("generalIcon");

      const iconType =
        (icon as RefinedAntdIcon | FaIcon | EasyopsIcon)?.icon ||
        (icon as LegacyAntdIcon)?.type;

      if (!icon || (!iconType && showEmptyIcon)) {
        return getDefaultIcon(bg, mergedStyle, iconNode);
      }

      if (icon.lib === "antd") {
        const type =
          (icon as RefinedAntdIcon).icon || (icon as LegacyAntdIcon).type;
        iconNode = (
          <LegacyIcon
            type={type}
            theme={icon.theme}
            style={mergedStyle}
            onClick={onClick}
            className={generalIconId}
            data-icon={
              (icon as RefinedAntdIcon).icon || (icon as LegacyAntdIcon).type
            }
          />
        );
      }

      if (icon.lib === "fa") {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const faIcon = icon.prefix ? [icon.prefix, icon.icon] : icon.icon;

        iconNode = (
          <Icon
            style={{ ...mergedStyle, verticalAlign: 0 }}
            component={() => (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              <FontAwesomeIcon icon={faIcon} className={cssStyle.faIcon} />
            )}
            onClick={onClick}
            className={generalIconId}
            data-icon={icon.icon}
          />
        );
      }

      if (icon.lib === "easyops") {
        iconNode = (
          <Icon
            style={mergedStyle}
            component={() => (
              <BrickIcon
                icon={(icon as EasyopsIcon).icon}
                category={(icon as EasyopsIcon).category}
              />
            )}
            onClick={onClick}
            className={generalIconId}
            data-icon={icon.icon}
          />
        );
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
              ...(isGradientColor(icon.color)
                ? { backgroundColor: "#fff" }
                : {}),
              ...mergedStyle,
            }}
            className={classnames({
              [cssStyle.roundSquareBg]: shape === "round-square",
            })}
          ></Avatar>
        );
      }
    } else {
      return getDefaultIcon(bg, getStyle(icon as MenuIcon), iconNode);
    }

    return iconNode;
  }, [
    bg,
    memoizedIcon,
    onClick,
    reverseBgColor,
    shape,
    showEmptyIcon,
    size,
    style,
  ]);
}

// Use deepEqual to compare icons, to avoid flicker of easyops icon.
function useDeepEqualMemo<T>(value: T): T {
  const ref = useRef<T>(undefined);

  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}
