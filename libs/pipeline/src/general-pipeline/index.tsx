import React, { useMemo } from "react";
import style from "./index.module.css";
import { GeneralIcon } from "@next-libs/basic-components";
import { AddStepButton, ButtonProps } from "./AddStepButton";
import { OperateButton, StepItem } from "./StepItem";
import { MenuIcon } from "@next-core/brick-types";

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
    renderOperates,
    onOperateClick,
    onAddStepClick,
  } = props;

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
          </div>
        ))}
      </div>
    ),
    [stageConfig]
  );

  return (
    <>
      {stageHeader}
      <div className={style.stageWrapper}>
        {stageConfig.map((stage, stageIndex) => (
          <div key={stage.key} className={style.stageItemWrapper}>
            {dataSource[stage.key]?.map((item, itemIndex) => {
              return (
                <StepItem
                  key={item.key}
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
