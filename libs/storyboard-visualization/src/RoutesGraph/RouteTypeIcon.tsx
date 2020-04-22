import React from "react";
import { Icon } from "antd";
import { ViewItem } from "../shared/interfaces";

interface RouteTypeIconProps {
  item: ViewItem;
  customStyle?: Record<string, any>;
}

export function RouteTypeIcon({
  item,
  customStyle,
}: RouteTypeIconProps): React.ReactElement {
  let icon;
  let color;
  if (item.type === "routes") {
    icon = "branches";
    color = "var(--theme-orange-color)";
  } else if (item.type === "bricks") {
    icon = "desktop";
    color = "var(--theme-green-color)";
  } else if (item.type === "redirect" || item.redirect) {
    icon = "arrow-right";
    color = "var(--theme-purple-color)";
  } else {
    return null;
  }
  if (icon) {
    return (
      <Icon
        style={{
          marginRight: "8px",
          color,
          fontSize: "14px",
          verticalAlign: "middle",
          ...customStyle,
        }}
        type={icon}
      />
    );
  }
}
