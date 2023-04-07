import { ColorResult, SketchPicker } from "react-color";
import { COLORS_MAP, Colors } from "@next-libs/basic-components";
import { Form } from "antd";
import React, { useEffect, useState, forwardRef } from "react";
import styles from "./ColorEditor.module.css";
import { isArray, isObject } from "lodash";
import { PresetColor } from "react-color/lib/components/sketch/Sketch";

export interface ColorEditorItemProps {
  name?: string;
  label?: string | React.ReactElement;
  required?: boolean;
  value?: any;
  onChange?: (value: string) => void;
  editorPresetColors?: PresetColor[];
}

const presetColorMap: Record<string, string> = {};

const getComputedColor = (key: string) => {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(key)
    ?.trim();
};

export function getDefaultPresetColors(
  colorMap: Record<
    Colors,
    {
      color: string;
      background: string;
      borderColor: string;
    }
  >
): PresetColor[] {
  const colorList: PresetColor[] = [];
  for (const [, group] of Object.entries(colorMap)) {
    ["color", "background", "borderColor"].forEach((name) => {
      const result = (group as Record<string, any>)[name]?.match(
        /^var\((.+)\)/
      );
      if (result) {
        const colorHex = getComputedColor(result[1]);
        if (colorHex) {
          colorList.push({ color: colorHex, title: result[0] });
          if (!presetColorMap[colorHex]) {
            presetColorMap[colorHex] = result[0];
          }
        }
      }
    });
  }

  return colorList;
}

const processEditorPresetColors = (editorPresetColors: PresetColor[]) => {
  const res: PresetColor[] = [];

  editorPresetColors?.forEach((item) => {
    if (typeof item === "string") {
      // css变量字符串或颜色字符串的情况
      const matchArr = item.match(/^var\((.+)\)/);
      if (isArray(matchArr) && matchArr?.length > 0) {
        const color = getComputedColor(matchArr[1]);
        if (color) {
          res.push({ title: matchArr[0], color });
          if (!presetColorMap[color]) {
            presetColorMap[color] = matchArr[0];
          }
        }
      } else {
        res.push(item);
      }
    } else if (isObject(item)) {
      // { title:..., color:... } 的情况, color也会分为css变量字符串或颜色字符串
      const matchArr = item?.color?.match(/^var\((.+)\)/);
      if (isArray(matchArr) && matchArr?.length > 0) {
        const color = getComputedColor(matchArr[1]);
        if (color) {
          res.push({ ...item, color });
          if (!presetColorMap[color]) {
            presetColorMap[color] = matchArr[0];
          }
        }
      } else {
        res.push(item);
      }
    }
  });
  return res;
};

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
    const rgba = `rgba( ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    const rgb = `rgb( ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    // 优先使用变量作为value
    const res = presetColorMap[rgba] ?? presetColorMap[rgb] ?? rgba;
    setValue(res);
    props.onChange(res);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    setPos([e.clientX, e.clientY]);
    setVisible(true);
  };

  const getPickerColor = () => {
    return value?.match(/^var\((.+)\)/)
      ? getComputedColor(value?.match(/^var\((.+)\)/)[1])
      : value;
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
            color={getPickerColor()}
            onChangeComplete={handleChangeComplete}
            presetColors={getDefaultPresetColors(COLORS_MAP).concat(
              processEditorPresetColors(props?.editorPresetColors)
            )}
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
      <ColorPick editorPresetColors={props?.editorPresetColors} />
    </Form.Item>
  );
}
