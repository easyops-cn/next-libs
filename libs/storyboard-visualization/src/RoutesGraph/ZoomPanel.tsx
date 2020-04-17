import React, { useState, useEffect } from "react";
import { Slider, Icon } from "antd";
import { SliderValue } from "antd/lib/slider";

import style from "./style.module.css";
// import { CustomIcon, CustomIconType } from "../../icons/CustomIcon";

interface ZoomPanelProps {
  scale: number;
  step: number;
  range: [number, number];
  notifyScaleChange: (scale: number) => void;
  style?: {
    position?: "absolute" | "relative";
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export function ZoomPanel(props: ZoomPanelProps): React.ReactElement {
  const step = Math.round(props.step * 100);
  const [min, max] = props.range.map((n) => Math.round(n * 100));
  const marks = { 100: "" };

  const [scale, setScale] = useState(Math.round(props.scale * 100));
  useEffect(() => {
    setScale(Math.round(props.scale * 100));
  }, [props.scale]);

  const onChange = (value: SliderValue) => {
    const scale = value as number;
    setScale(scale);
    props.notifyScaleChange(scale / 100);
  };

  const zoomInClick = () => {
    const value = Math.min(max, scale + step);
    if (scale !== value) {
      onChange(value);
    }
  };

  const zoomOutClick = () => {
    const value = Math.max(min, scale - step);
    if (scale !== value) {
      onChange(value);
    }
  };

  const formatter = (value: number): string => {
    return `${value}%`;
  };

  return (
    <div
      style={{ ...props.style, padding: "8px 0" }}
      className={style.zoomPanel}
    >
      <Icon type="plus" onClick={zoomInClick} />
      {/* <CustomIcon
        type={CustomIconType.ZoomIn}
        style={{ color: "#6C9CF9" }}
        onClick={zoomInClick}
      ></CustomIcon> */}

      <Slider
        vertical
        tooltipPlacement="left"
        tipFormatter={formatter}
        min={min}
        max={max}
        step={step}
        value={scale}
        onChange={onChange}
      ></Slider>
      <Icon type="minus" onClick={zoomOutClick} />
      {/* <CustomIcon
        type={CustomIconType.ZoomOut}
        style={{ color: "#6C9CF9", paddingTop: 4 }}
        onClick={zoomOutClick}
      ></CustomIcon> */}
    </div>
  );
}
