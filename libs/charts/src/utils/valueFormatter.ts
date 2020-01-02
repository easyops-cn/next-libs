import { humanizeDataValue } from "./data";
import { humanizeDataRateValue } from "./dataRate";

import { Format } from "../interfaces/panel";

import { FormatType } from "../constants/format";

export const convertValueByPrecision = (
  value: number,
  precision?: number
): string => {
  return precision === undefined ? value.toString() : value.toFixed(precision);
};

export const formatValue = (
  value: number,
  format?: Format
): [string, string] => {
  if (format) {
    const { type, precision } = format;
    switch (type) {
      case FormatType.PERCENT: {
        return [`${convertValueByPrecision(value * 100, precision)}%`, null];
      }
      case FormatType.DATA: {
        const [dataValue, dataUnit] = humanizeDataValue(value, format.unit);
        return [`${convertValueByPrecision(dataValue, precision)}`, dataUnit];
      }
      case FormatType.DATA_RATE: {
        const [dataRateValue, dataRateUnit] = humanizeDataRateValue(
          value,
          format.unit
        );
        return [
          `${convertValueByPrecision(dataRateValue, precision)}`,
          dataRateUnit
        ];
      }
      default: {
        return [convertValueByPrecision(value, precision), format.unit];
      }
    }
  } else {
    return [value.toString(), null];
  }
};
