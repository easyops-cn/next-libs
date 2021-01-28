import React from "react";
import { Badge as AntdBadge } from "antd";
import { BadgeProps as AntdBadgeProps } from "antd/lib/badge";
import { BrickAsComponent } from "@next-core/brick-kit";
import { UseBrickConf, MenuIcon } from "@next-core/brick-types";
import { GeneralIcon } from "./GeneralIcon";

export interface BadgeProps extends AntdBadgeProps {
  dataSource?: any;
  content?: string | { useBrick: UseBrickConf; dataSource?: any };
  contentIcon?: MenuIcon;
  countColor?: string;
  color?: string;
}

export function Badge(props: BadgeProps): React.ReactElement {
  const renderContent = (conf: UseBrickConf, data: any): React.ReactElement => {
    return <BrickAsComponent useBrick={conf} data={data} />;
  };

  const shouldShowIcon =
    props.contentIcon && typeof props.contentIcon === "object";
  return (
    <AntdBadge
      count={props.count}
      overflowCount={props.overflowCount}
      offset={props.offset}
      dot={props.dot}
      showZero={props.showZero}
      {...(props.dot === true
        ? { color: `var(--theme-${props.color}-color)` }
        : // antd Badge 的 color 属性对数字的圆圈不起作用, 手动用 background 覆盖
          {
            style: {
              background: `var(--theme-${props.color}-color)`,
            },
          })}
    >
      {shouldShowIcon && <GeneralIcon icon={props.contentIcon} />}
      {typeof props.content === "string" ? (
        <span style={shouldShowIcon && { marginLeft: "5px" }}>
          {props.content}
        </span>
      ) : typeof props.content === "object" &&
        props.content.dataSource !== undefined ? (
        renderContent(props.content.useBrick, props.content.dataSource)
      ) : typeof props.content === "object" ? (
        renderContent(props.content.useBrick, props.dataSource)
      ) : (
        ""
      )}
    </AntdBadge>
  );
}
