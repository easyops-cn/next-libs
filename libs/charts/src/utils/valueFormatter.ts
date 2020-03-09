import { Format } from "../interfaces/panel";

import { humanizePercentValue } from "./percent";
import { humanizeTimeValue } from "./time";
import { humanizeDataValue } from "./data";
import { humanizeDataRateValue } from "./dataRate";

import { FormatType, formatUnitIds } from "../constants/format";
import { PercentFormatUnitId } from "../constants/format/percent";
import { TimeFormatUnitId } from "../constants/format/time";
import { DataFormatUnitId } from "../constants/format/data";
import { DataRateFormatUnitId } from "../constants/format/dataRate";

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
    let { type } = format;
    if (!type) {
      type = FormatType.None;
      Object.entries(formatUnitIds).map(([formatType, units]) => {
        if (units.includes(format.unit)) {
          type = formatType as FormatType;
        }
      });
    }

    const precision = format?.precision === undefined ? 2 : format.precision;
    switch (type) {
      case FormatType.Percent: {
        const percentValue = humanizePercentValue(
          value,
          format.unit as PercentFormatUnitId
        );
        return [`${convertValueByPrecision(percentValue, precision)}%`, null];
      }
      case FormatType.Time: {
        const [timeValue, timeUnitDisplay] = humanizeTimeValue(
          value,
          format.unit as TimeFormatUnitId
        );
        return [
          `${convertValueByPrecision(
            timeValue,
            format?.precision === undefined ? 1 : format.precision
          )}`,
          timeUnitDisplay
        ];
      }
      case FormatType.Data: {
        const [dataValue, dataUnitDisplay] = humanizeDataValue(
          value,
          format.unit as DataFormatUnitId
        );
        return [
          `${convertValueByPrecision(dataValue, precision)}`,
          dataUnitDisplay
        ];
      }
      case FormatType.DataRate: {
        const [dataRateValue, dataRateUnitDisplay] = humanizeDataRateValue(
          value,
          format.unit as DataRateFormatUnitId
        );
        return [
          `${convertValueByPrecision(dataRateValue, precision)}`,
          dataRateUnitDisplay
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
