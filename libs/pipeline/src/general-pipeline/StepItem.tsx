import { GeneralIcon } from "@next-libs/basic-components";
import React, { useEffect, useRef, useState, useMemo } from "react";
import style from "./StepItem.module.css";
import classnames from "classnames";
import { Button, Tooltip } from "antd";
import { MenuIcon } from "@next-core/brick-types";
import { RefRepositoryType } from "./constants";
import { useCurrentTheme } from "@next-core/brick-kit";

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
  operateButtonsTrigger?: "click" | "hover";
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
    operateButtonsTrigger = "click",
    onOperateButtonClick,
    onStepItemClick,
    keys,
    refRepository,
  } = props;

  const [operateVisible, setOperateVisible] = useState(false);

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

  const handleMouseEnter = (): void => {
    operateButtonsTrigger === "hover" && setOperateVisible(true);
  };
  const handleMouseLeave = (): void => {
    operateButtonsTrigger === "hover" && setOperateVisible(false);
  };

  const handleStepItemClick = (): void => {
    onStepItemClick?.(
      {
        hasOperateButtons: !!operateButtons,
        disabled: !!disabled,
      },
      data
    );
    if (operateButtons && operateButtonsTrigger === "click") {
      setOperateVisible(true);
    }
  };

  const handleHideOperate = (): void => {
    setOperateVisible(false);
  };

  const theme = useCurrentTheme();
  const isDark = useMemo(() => {
    return theme === "dark-v2";
  }, [theme]);

  return (
    <>
      <div
        className={classnames(style.stepItem, {
          [style.stepItemActive]: operateVisible,
          [style.stepItemDisabled]: disabled,
          [style.stepItemDark]: isDark,
        })}
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleStepItemClick}
      >
        <div
          className={style.colorTip}
          style={{
            backgroundColor: disabled
              ? "var(--color-text-divider-line)"
              : color,
          }}
        />
        <div />
        <GeneralIcon
          icon={{
            ...icon,
            color: disabled ? "var(--color-text-divider-line)" : color,
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
      {operateButtonsTrigger === "click" && (
        <div
          className={style.operateWrapper}
          style={{
            display: operateVisible ? "block" : "none",
          }}
          onClick={handleHideOperate}
        />
      )}
    </>
  );
}
