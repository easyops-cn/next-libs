import React, { useState, useEffect } from "react";
import Icon from "@ant-design/icons";
import { Slider, Button } from "antd";
import style from "./ZoomPanel.module.css";
import { ReactComponent as zoomIn } from "./svg/zoom-in.svg";
import { ReactComponent as zoomOut } from "./svg/zoom-out.svg";
import { ReactComponent as CenterSvg } from "./svg/center.svg";

interface ZoomPanelProps {
  scale: number;
  step: number;
  range: [number, number];
  notifyScaleChange?: (scale: number) => void;
  autoCenter?: () => void;
}

export function ZoomPanel(props: ZoomPanelProps): React.ReactElement {
  const step = Math.round(props.step * 100);
  const [min, max] = props.range.map((n) => Math.round(n * 100));
  const marks = { 100: "" };

  const [scale, setScale] = useState(Math.round(props.scale * 100));
  useEffect(() => {
    setScale(Math.round(props.scale * 100));
  }, [props.scale]);

  const onChange = (value: number) => {
    const scale = value;
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
    <>
      <Button className={style.centerIcon} onClick={props.autoCenter}>
        <Icon component={CenterSvg as any} />
      </Button>
      <div className={style.zoomPanel}>
        <Icon
          style={{ color: "var(--palette-blue-7)" }}
          component={zoomIn as any}
          onClick={zoomInClick}
        />
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
        <Icon
          style={{ color: "var(--palette-blue-7)" }}
          component={zoomOut as any}
          onClick={zoomOutClick}
        />
      </div>
    </>
  );
}
