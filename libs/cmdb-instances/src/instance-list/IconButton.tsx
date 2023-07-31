import React from "react";
import { Tooltip } from "antd";
import styles from "./IconButton.module.css";
import classNames from "classnames";
import { GeneralIcon } from "@next-libs/basic-components";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";

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
      case "filterInstanceSource":
        return (
          <GeneralIcon
            icon={{ lib: "antd", icon: "filter", theme: "filled" }}
          />
        );
    }
  };
  const getTooltip = () => {
    switch (props.type) {
      case "relateToMe":
      case "normalHost":
      case "allName":
        return checked
          ? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_CANCEL_FILTER}`, {
              label: props.label,
            })
          : i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_FILTER}`, {
              label: props.label,
            });
      case "showHiddenInfo":
        return checked
          ? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_HIDDEN}`, {
              label: props.label,
            })
          : i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_SHOW}`, {
              label: props.label,
            });
      case "filterInstanceSource":
        return i18n.t(
          `${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_FILTER_INSTANCE_SOURCE}`
        );
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
