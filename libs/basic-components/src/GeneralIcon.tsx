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
import { isEqual, omit, uniqueId } from "lodash";
import { getRuntime } from "@next-core/brick-kit";

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
  noPublicRoot?: boolean;
  imageLoading?: "lazy" | "eager";
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
  noPublicRoot,
  imageLoading,
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
              style={omit(mergedStyle, "background")}
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
          src={
            /^(?:https?|data):|^\//.test(icon.imgSrc)
              ? icon.imgSrc
              : `${
                  noPublicRoot
                    ? getRuntime().getBasePath()
                    : (window as any).PUBLIC_ROOT ?? ""
                }${icon.imgSrc}`
          }
          width={size}
          height={size}
          style={icon.imgStyle}
          onClick={onClick}
          loading={imageLoading}
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

      const iconType =
        (icon as RefinedAntdIcon | FaIcon | EasyopsIcon)?.icon ||
        (icon as LegacyAntdIcon)?.type;

      if (!icon || (!iconType && showEmptyIcon)) {
        return getDefaultIcon(bg, mergedStyle, iconNode);
      }

      const migrateV3 =
        process.env.NODE_ENV === "test"
          ? false
          : getRuntime().getFeatureFlags()["migrate-to-brick-next-v3"];
      const gradientColor = isGradientColor(icon.color)
        ? icon.color
        : undefined;
      const generalIconId =
        gradientColor && (!migrateV3 || icon.lib !== "fa")
          ? uniqueId("generalIcon")
          : undefined;

      const mergedStyleByBg = bg
        ? omit(mergedStyle, "background")
        : mergedStyle;

      if (icon.lib === "antd") {
        const type =
          (icon as RefinedAntdIcon).icon || (icon as LegacyAntdIcon).type;
        iconNode = (
          <LegacyIcon
            type={type}
            theme={icon.theme}
            style={mergedStyleByBg}
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
        const faIcon: IconName | [IconPrefix, IconName] = icon.prefix
          ? [icon.prefix, icon.icon]
          : icon.icon;
        const migrateProps = migrateV3 ? { gradientColor } : null;

        iconNode = (
          <Icon
            style={{ ...mergedStyleByBg, verticalAlign: 0 }}
            component={() => (
              <FontAwesomeIcon
                icon={faIcon}
                className={cssStyle.faIcon}
                {...migrateProps}
              />
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
            style={mergedStyleByBg}
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

      if (gradientColor && generalIconId) {
        let gradientIconDirection;
        switch (gradientColor.direction) {
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
                    <stop offset="0%" stopColor={gradientColor.startColor} />
                    <stop offset="100%" stopColor={gradientColor.endColor} />
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
              ...(gradientColor ? { backgroundColor: "#fff" } : {}),
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
    noPublicRoot,
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
