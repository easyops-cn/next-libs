import { GeneralIcon } from "@next-libs/basic-components";
import React, { useEffect, useRef, useState } from "react";
import style from "./StepItem.module.css";
import classnames from "classnames";
import { Button, Tooltip } from "antd";
import { MenuIcon } from "@next-core/brick-types";
import { RefRepositoryType } from "./constants";

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
  data?: any;
  onOperateButtonClick?: (detail: { key: string }, data: any) => void;
  onStepItemClick?: (
    detail: {
      hasOperateButtons: boolean;
      disabled: boolean;
    },
    data: any
  ) => void;
  keys: {
    nodeKey: string;
    indexKey: [number, number];
  };
  refRepository?: RefRepositoryType;
}

export function StepItem(props: StepItemProps): React.ReactElement {
  const {
    color,
    disabled,
    icon,
    title,
    operateButtons,
    data,
    onOperateButtonClick,
    onStepItemClick,
    keys,
    refRepository,
  } = props;

  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    refRepository?.set(keys.nodeKey, {
      element: ref.current,
      index: keys.indexKey,
      nodeData: data,
    });
    return () => {
      refRepository?.delete(keys.nodeKey);
    };
  }, [keys]);

  const [operateVisible, setOperateVisible] = useState(false);

  const handleStepItemClick = (): void => {
    onStepItemClick?.(
      {
        hasOperateButtons: !!operateButtons,
        disabled: !!disabled,
      },
      data
    );
    if (!operateButtons) {
      return;
    }
    setOperateVisible(true);
  };

  const handleHideOperate = (): void => {
    setOperateVisible(false);
  };

  return (
    <>
      <div
        className={classnames(style.stepItem, {
          [style.stepItemActive]: operateVisible,
          [style.stepItemDisabled]: disabled,
        })}
        ref={ref}
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
                    onOperateButtonClick?.({ key: v.key }, data);
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
