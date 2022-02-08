import React, { useEffect, useMemo, useRef, useState } from "react";
import style from "./index.module.css";
import { GeneralIcon } from "@next-libs/basic-components";
import { AddStepButton, ButtonProps } from "./AddStepButton";
import { OperateButton, StepItem } from "./StepItem";
import { MenuIcon } from "@next-core/brick-types";
import ResizeObserver from "resize-observer-polyfill";
import { getPathByNodes, PathData } from "./util";
import { Graphics } from "./Graphics";
import { sortBy } from "lodash";

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

  const [pathData, setPathData] = useState<PathData>({} as PathData);

  const stageWrapperRef = useRef();

  const _refRepository = useRef<
    Map<string, { element: HTMLElement; index: string }>
  >(new Map());

  const getPathData = (): PathData => {
    const data = sortBy(
      [..._refRepository.current.entries()],
      (item) => item[1].index
    ).map(([key, { element, index }]) => {
      const x = element.offsetLeft + element.offsetWidth / 2;
      const y = element.offsetTop + element.offsetHeight / 2;
      const [stageIndex, stepIndex] = key.split(",");
      return { stageIndex, stepIndex, x, y, element, key };
    });
    return getPathByNodes(data);
  };

  useEffect(() => {
    setPathData(showSerialLine ? getPathData() : ({} as PathData));
  }, [_refRepository.current.size, showSerialLine]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setPathData(showSerialLine ? getPathData() : ({} as PathData));
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
          <Graphics pathData={pathData} />
        )}
        {stageConfig.map((stage, stageIndex) => (
          <div key={stage.key} className={style.stageItemWrapper}>
            {dataSource[stage.key]?.map((item, itemIndex) => {
              return (
                <StepItem
                  key={item.key}
                  keys={{
                    nodeKey: item.key,
                    indexKey: `${stageIndex},${itemIndex}`,
                  }}
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
