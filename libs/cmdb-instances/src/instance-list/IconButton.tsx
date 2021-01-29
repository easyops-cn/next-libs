import React from "react";
import { Tooltip } from "antd";
import styles from "./IconButton.module.css";
import classNames from "classnames";
import { GeneralIcon } from "@next-libs/basic-components";

interface IconButtonProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  type: string;
  style?: Record<string, any>;
  label: string;
  disabled?: boolean;
}

export function IconButton(props: IconButtonProps) {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(!!props.checked);
  }, [props]);

  const handleClick = (checked: boolean) => {
    setChecked(checked);
    props.onChange(checked);
  };

  const getIcon = () => {
    switch (props.type) {
      case "relateToMe":
        return (
          <GeneralIcon icon={{ lib: "fa", icon: "user", prefix: "fas" }} />
        );
      case "showHiddenInfo":
        return <GeneralIcon icon={{ lib: "fa", icon: "expand-alt" }} />;
      case "normalHost":
        return <GeneralIcon icon={{ lib: "fa", icon: "tv", prefix: "fas" }} />;
      case "allName":
        return <GeneralIcon icon={{ lib: "fa", icon: "cube" }} />;
    }
  };
  const getTooltip = () => {
    switch (props.type) {
      case "relateToMe":
      case "normalHost":
      case "allName":
        return checked
          ? `点击取消筛选"${props.label}"`
          : `点击筛选"${props.label}"`;
      case "showHiddenInfo":
        return checked
          ? `点击隐藏"${props.label}"`
          : `点击显示"${props.label}"`;
    }
  };

  return (
    <Tooltip placement="top" title={getTooltip()}>
      <a
        style={props.style}
        className={classNames({
          [styles.iconBtnBac]: true,
          [styles.selected]: checked,
          [styles.disabled]: props.disabled,
        })}
        onClick={() => !props.disabled && handleClick(!checked)}
      >
        {getIcon()}
      </a>
    </Tooltip>
  );
}
