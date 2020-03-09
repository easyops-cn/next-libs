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
}
