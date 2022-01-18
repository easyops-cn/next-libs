import { GeneralIcon } from "@next-libs/basic-components";
import React, { useEffect, useState } from "react";
import style from "./StepItem.module.css";
import classnames from "classnames";
import { Button, Tooltip } from "antd";
import { MenuIcon } from "@next-core/brick-types";

export type OperateButton = {
  icon: MenuIcon;
  key: string;
  tooltip?: string;
  disabled?: boolean;
};

interface StepItemProps {
  title: string;
  icon: MenuIcon;
  color?: string;
  disabled?: boolean;
  operateButtons?: OperateButton[];
  onOperateButtonClick?: (data: { key: string }) => void;
  onStepItemClick?: (data: {
    hasOperateButtons: boolean;
    disabled: boolean;
  }) => void;
}

export function StepItem(props: StepItemProps): React.ReactElement {
  const {
    color,
    disabled,
    icon,
    title,
    operateButtons,
    onOperateButtonClick,
    onStepItemClick,
  } = props;

  const [operateVisible, setOperateVisible] = useState(false);

  const handleStepItemClick = (e: any): void => {
    onStepItemClick?.({
      hasOperateButtons: !!operateButtons,
      disabled: !!disabled,
    });
    if (!operateButtons) {
      return;
    }
    setOperateVisible(true);
  };

  const handleHideOperate = () => {
    setOperateVisible(false);
  };

  return (
    <>
      <div
        className={classnames(style.stepItem, {
          [style.stepItemActive]: operateVisible,
          [style.stepItemDisabled]: disabled,
        })}
        onClick={handleStepItemClick}
      >
        <div
          className={style.colorTip}
          style={{ backgroundColor: disabled ? "#D9D9D9" : color }}
        />
        <div />
        <GeneralIcon
          icon={{
            ...icon,
            color: disabled ? "#D9D9D9" : color,
          }}
          style={{ fontSize: 16 }}
        />
        <div />
        <span className={style.stepName} title={title}>
          {title}
        </span>
        <div />
        {operateButtons && operateVisible && (
          <div
            className={style.operateList}
            onClick={(e) => e.stopPropagation()}
          >
            {operateButtons?.map((v) => (
              <Tooltip key={v.key} title={v.tooltip}>
                <Button
                  type="link"
                  disabled={v.disabled}
                  onClick={(e) => {
                    onOperateButtonClick?.({ key: v.key });
                    handleHideOperate();
                  }}
                >
                  <GeneralIcon icon={v.icon} />
                </Button>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
      <div
        className={style.operateWrapper}
        style={{
          display: operateVisible ? "block" : "none",
        }}
        onClick={handleHideOperate}
      />
    </>
  );
}
