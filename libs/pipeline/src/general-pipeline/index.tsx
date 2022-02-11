import React, { useEffect, useMemo, useRef, useState } from "react";
import style from "./index.module.css";
import { GeneralIcon } from "@next-libs/basic-components";
import { AddStepButton, ButtonProps } from "./AddStepButton";
import { OperateButton, StepItem } from "./StepItem";
import { MenuIcon } from "@next-core/brick-types";
import ResizeObserver from "resize-observer-polyfill";
import { getPathByNodes } from "./util";
import { Graphics } from "./Graphics";
import { sortBy } from "lodash";
import { PathData, PathType, RefRepositoryType } from "./constants";

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
  onOperateClick?(operate: { key: string }, data: any): void;
  onAddStepClick?(data: { key: string | [string, string] }): void;
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

  const _refRepository = useRef<RefRepositoryType>(new Map());

  const getPathData = (): PathData => {
    const formatData = [..._refRepository.current.entries()].map(
      ([key, { element, index, nodeData }]) => {
        const x = element.offsetLeft + element.offsetWidth / 2;
        const y = element.offsetTop + element.offsetHeight / 2;
        const [stageIndex, stepIndex] = index;
        return { stageIndex, stepIndex, x, y, element, key, nodeData };
      }
    );
    const sortedData = sortBy(formatData, ["stageIndex", "stepIndex"]);
    return getPathByNodes(sortedData);
  };

  useEffect(() => {
    setPathData(showSerialLine ? getPathData() : ({} as PathData));
  }, [_refRepository.current.size, showSerialLine]);

  useEffect(() => {
    // istanbul ignore next
    const resizeObserver = new ResizeObserver(() => {
      setPathData(showSerialLine ? getPathData() : ({} as PathData));
    });
    resizeObserver.observe(stageWrapperRef.current);

    return () => {
      resizeObserver?.disconnect();
    };
  }, []);

  const handleStepItemClick = (
    detail: {
      hasOperateButtons: boolean;
      disabled: boolean;
    },
    data: any
  ): void => {
    if (!detail.hasOperateButtons) {
      onOperateClick?.(null, data);
    }
  };
  const handleOperateButtonClick = (
    detail: { key: string },
    data: any
  ): void => {
    onOperateClick?.(detail, data);
  };

  const handleAddStepButtonClick = (data: {
    key: string;
    hasSubButtons: boolean;
  }): void => {
    if (!data.hasSubButtons) {
      onAddStepClick?.({ key: data.key });
    }
  };
  const handleSubButtonClick = (data: { key: [string, string] }): void => {
    onAddStepClick?.({ key: data.key });
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
                    indexKey: [stageIndex, itemIndex],
                  }}
                  refRepository={_refRepository.current}
                  title={item.title}
                  icon={item.icon}
                  color={item.color}
                  disabled={item.disabled}
                  data={item.data}
                  operateButtons={renderOperates(item.data)}
                  onOperateButtonClick={handleOperateButtonClick}
                  onStepItemClick={handleStepItemClick}
                />
              );
            })}
            <AddStepButton
              addButtonProps={stage.addStepButton}
              subButtons={stage.addStepButton?.subButtons}
              onAddStepButtonClick={handleAddStepButtonClick}
              onSubButtonClick={handleSubButtonClick}
            />
          </div>
        ))}
      </div>
    </>
  );
}
