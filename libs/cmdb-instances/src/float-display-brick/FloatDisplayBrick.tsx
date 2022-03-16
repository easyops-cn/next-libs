import React from "react";
import { Tooltip } from "antd";

interface FloatDisplayBrickProps {
  floatValue: number;
}
export const floatMaxLengthMatch = (value: string): string => {
  const pattern = /[0-9]+(.[0-9]{1,4})?/;
  return value.match(pattern)?.[0];
};
export function FloatDisplayBrick(
  props: FloatDisplayBrickProps
): React.ReactElement {
  const { floatValue } = props;
  const value = floatValue + "";
  const regex = /^[0-9]+(.[0-9]{1,4})?$/gi;
  return value && !regex.test(value) ? (
    <Tooltip title={floatValue}>
      <span style={{ cursor: "pointer" }} key={floatValue}>
        {floatMaxLengthMatch(value)}
      </span>
    </Tooltip>
  ) : (
    <span>{floatValue}</span>
  );
}
