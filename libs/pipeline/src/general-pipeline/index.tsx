import React, { useEffect, useMemo, useRef, useState } from "react";
import style from "./index.module.css";
import { GeneralIcon } from "@next-libs/basic-components";
import { AddStepButton, ButtonProps } from "./AddStepButton";
import { OperateButton, StepItem } from "./StepItem";
import { MenuIcon } from "@next-core/brick-types";
import ResizeObserver from "resize-observer-polyfill";
import { getPathByNodes } from "./util";

export interface GeneralPipelineProps {
  stageConfig: {
    stageName: string;
    color: string;
    textColor?: string;
    icon: any;
    key: string;
    addStepButton?: ButtonProps & {
      subButtons?: ButtonProps[];
    };
  }[];
  dataSource: {
    // 对应stageConfig里的key
    [key: string]: {
      title: string;
      icon: MenuIcon;
      color: string;
      disabled?: boolean;
      key: string;
      data?: any;
    }[];
  };
  /**
   * notice⚠️: 供告警规则构件使用，后续可能会被废弃
   */
  showSerialLine?: boolean;
  renderOperates?(data: any): OperateButton[];
  onOperateClick?(operate: any, data: any): void;
  onAddStepClick?(data: any): void;
}

export function GeneralPipeline(
  props: GeneralPipelineProps
): React.ReactElement {
  const {
    stageConfig,
    dataSource,
    showSerialLine,
    renderOperates,
    onOperateClick,
    onAddStepClick,
  } = props;

  const [linePath, setLinePath] = useState("");

  const stageWrapperRef = useRef();

  const _refRepository = useRef<Map<string, HTMLElement>>(new Map());

  const getLinePath = (): string =>
    getPathByNodes([..._refRepository.current.entries()]);

  useEffect(() => {
    setLinePath(showSerialLine ? getLinePath() : "");
  }, [_refRepository.current.size, showSerialLine]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setLinePath(showSerialLine ? getLinePath() : "");
    });
    resizeObserver.observe(stageWrapperRef.current);

    return () => {
      resizeObserver?.disconnect();
    };
  }, []);

  const handleStepItemClick = (e: any, data: any) => {
    if (!e.hasOperateButtons) {
      onOperateClick?.(null, data);
    }
  };
  const handleOperateButtonClick = (e: any, data: any) => {
    onOperateClick?.(e, data);
  };

  const handleAddStepButtonClick = (e: any) => {
    if (!e.hasSubButtons) {
      onAddStepClick?.({ key: e.key });
    }
  };
  const handleSubButtonClick = (e: any) => {
    onAddStepClick?.({ key: e.key });
  };

  const stageHeader = useMemo(
    () => (
      <div className={style.stageHeader}>
        {stageConfig.map((v) => (
          <div
            key={v.key}
            className={style.stageHeaderItem}
            style={{ color: v.color }}
          >
            <div className={style.herderTitle}>
              <GeneralIcon icon={v.icon} />
              <span
                className={style.herderTitleText}
                style={{ color: v.textColor }}
              >
                {v.stageName}
              </span>
            </div>
            <div className={style.whiteGap} />
          </div>
        ))}
      </div>
    ),
    [stageConfig]
  );

  return (
    <>
      {stageHeader}
      <div className={style.stageWrapper} ref={stageWrapperRef}>
        {showSerialLine && _refRepository.current.size !== 0 && (
          <svg style={{ position: "absolute", width: "100%", height: "100%" }}>
            <path d={linePath} stroke="#D9D9D9" fill="none" strokeWidth="1" />
            {Array(5)
              .fill(undefined)
              .map((v, i, arr) => {
                const arrowLength = arr.length;
                const nodeLength = _refRepository.current.size;
                const minDur = 5;
                let dur = nodeLength * 1;
                dur = dur > minDur ? dur : minDur;
                const interval = dur / arrowLength;
                const opacity = 1 - 0.15 * i;
                return (
                  <path
                    d="M0 0 L6.75 5 L0 10 L0 0 M6.75 0 L13.5 5 L6.75 10 L6.75 0"
                    fill="#0b5ad9"
                    fillRule="evenodd"
                    transform="translate(-10, -5) "
                    key={i}
                    opacity={opacity}
                  >
                    <animateMotion
                      begin={interval * i}
                      dur={dur}
                      repeatCount="indefinite"
                      path={linePath}
                      rotate="auto"
                    />
                  </path>
                );
              })}
            <rect x="0" y="0" width="27" height="10" fill="#f0f9ff" />
          </svg>
        )}
        {stageConfig.map((stage, stageIndex) => (
          <div key={stage.key} className={style.stageItemWrapper}>
            {dataSource[stage.key]?.map((item, itemIndex) => {
              return (
                <StepItem
                  key={item.key}
                  nodeKey={`${stageIndex},${itemIndex}`}
                  refRepository={_refRepository.current}
                  title={item.title}
                  icon={item.icon}
                  color={item.color}
                  disabled={item.disabled}
                  operateButtons={renderOperates(item.data)}
                  onOperateButtonClick={(e) =>
                    handleOperateButtonClick(e, item.data)
                  }
                  onStepItemClick={(e) => handleStepItemClick(e, item.data)}
                />
              );
            })}
            <AddStepButton
              addButtonProps={stage.addStepButton}
              subButtons={stage.addStepButton?.subButtons}
              onAddStepButtonClick={(e) => handleAddStepButtonClick(e)}
              onSubButtonClick={(e) => handleSubButtonClick(e)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
