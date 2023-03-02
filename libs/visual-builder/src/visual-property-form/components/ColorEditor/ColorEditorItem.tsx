import { ColorResult, SketchPicker } from "react-color";
import { COLORS_MAP, Colors } from "@next-libs/basic-components";
import { Form } from "antd";
import React, { useEffect, useState, forwardRef } from "react";
import styles from "./ColorEditor.module.css";

export interface ColorEditorItemProps {
  name?: string;
  label?: string | React.ReactElement;
  required?: boolean;
  value?: any;
  onChange?: (value: string) => void;
}

export function getPresetColors(
  colorMap: Record<
    Colors,
    {
      color: string;
      background: string;
      borderColor: string;
    }
  >
): string[] {
  const colorList: string[] = [];
  for (const [, group] of Object.entries(colorMap)) {
    ["color", "background", "borderColor"].forEach((name) => {
      const result = (group as Record<string, any>)[name]?.match(
        /^var\((.+)\)/
      );
      if (result) {
        const colorHex = window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(result[1])
          ?.trim();
        colorHex && colorList.push(colorHex);
      }
    });
  }

  return colorList;
}

export function LegacyColorPick(
  props: ColorEditorItemProps,
  ref: React.Ref<any>
) {
  const [value, setValue] = useState(props.value);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState([0, 0]);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const handleChangeComplete = (color: ColorResult) => {
    setValue(color.hex);
    props.onChange(color.hex);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    setPos([e.clientX, e.clientY]);
    setVisible(true);
  };

  return (
    <div className={styles.colorContainer}>
      <div className={styles.colorCube} onClick={handleClick}>
        <div
          className={styles.colorContent}
          style={{ backgroundColor: value }}
        />
      </div>
      {visible && (
        <div
          className={styles.popover}
          style={{
            top: pos[1] - 385 - 16,
          }}
        >
          <div className={styles.cover} onClick={() => setVisible(false)} />
          <SketchPicker
            width="230px"
            ref={ref}
            color={value}
            onChangeComplete={handleChangeComplete}
            presetColors={getPresetColors(COLORS_MAP)}
          />
        </div>
      )}
    </div>
  );
}

export const ColorPick = forwardRef(LegacyColorPick);

export function ColorEditorItem(props: ColorEditorItemProps) {
  return (
    <Form.Item
      key={props.name}
      name={props.name}
      label={props.label}
      rules={[{ required: props.required, message: `请输入${props.name}` }]}
    >
      <ColorPick />
    </Form.Item>
  );
}
