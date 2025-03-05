import { FormatType } from "../constants/format";

export interface Grid {
  row?: number;
  column?: number;
}

export interface Fields {
  value: string;
}

export interface Format {
  type?: FormatType;
  precision?: number;
  unit?: string;
  /**
   * 是否固定小数点位数。设置为 `fixedPrecision: false` 时，`1.50` 会变成 `1.5`。
   *
   * @default true
   */
  fixedPrecision?: boolean;
}
