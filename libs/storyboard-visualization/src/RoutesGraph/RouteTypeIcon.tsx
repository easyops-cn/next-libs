import React from "react";
import { ViewItem } from "../shared/interfaces";
import {
  BranchesOutlined,
  DesktopOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

interface RouteTypeIconProps {
  item: ViewItem;
  customStyle?: Record<string, any>;
}

export function RouteTypeIcon({
  item,
  customStyle,
}: RouteTypeIconProps): React.ReactElement {
  const style = {
    marginRight: "8px",
    fontSize: "14px",
    verticalAlign: "middle",
    ...customStyle,
  };
  if (item.type === "routes") {
    return (
      <BranchesOutlined
        style={{
          color: "var(--theme-orange-color)",
          ...style,
        }}
      />
    );
  } else if (item.type === "bricks") {
    return (
      <DesktopOutlined
        style={{
          color: "var(--theme-green-color)",
          ...style,
        }}
      />
    );
  } else if (item.type === "redirect" || item.redirect) {
    return (
      <ArrowRightOutlined
        style={{
          color: "var(--theme-purple-color)",
          ...style,
        }}
      />
    );
  } else {
    return null;
  }
}
