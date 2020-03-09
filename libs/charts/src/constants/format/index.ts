import { percentFormatUnitIds } from "./percent";
import { timeFormatUnitIds } from "./time";
import { dataFormatUnitIds } from "./data";
import { dataRateFormatUnitIds } from "./dataRate";

export enum FormatType {
  None = "none",
  Percent = "percent",
  Time = "time",
  Data = "data",
  DataRate = "data_rate"
}

export const formatUnitIds: { [type: string]: string[] } = {
  [FormatType.None]: [],
  [FormatType.Percent]: percentFormatUnitIds,
  [FormatType.Time]: timeFormatUnitIds,
  [FormatType.Data]: dataFormatUnitIds,
  [FormatType.DataRate]: dataRateFormatUnitIds
};

export * from "./percent";
export * from "./time";
export * from "./data";
export * from "./dataRate";
