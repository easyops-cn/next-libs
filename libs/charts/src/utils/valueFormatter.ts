import { Format } from "../interfaces/panel";

import { humanizePercentValue } from "./percent";
import { humanizeTimeValue } from "./time";
import { humanizeDataValue } from "./data";
import { humanizeDataRateValue } from "./dataRate";
import { humanizeNumberValue } from "./number";

import { FormatType, formatUnitIds } from "../constants/format";
import {
  PercentUnitId,
  TimesUnitId,
  BytesUnitId,
  ByteRatesUnitId,
  ShortUnitId,
} from "@libs/constants";

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
    if (!type && format.unit) {
      type = FormatType.Short;
      Object.entries(formatUnitIds).map(([formatType, units]) => {
        if (
          units
            .map((unit) => unit.toLocaleLowerCase())
            .includes(format.unit.toLocaleLowerCase())
        ) {
          type = formatType as FormatType;
        }
      });
    }

    const precision = format?.precision === undefined ? 2 : format.precision;
    switch (type) {
      case FormatType.Percent: {
        const percentValue = humanizePercentValue(
          value,
          format.unit as PercentUnitId
        );
        return [`${convertValueByPrecision(percentValue, precision)}%`, null];
      }
      case FormatType.Time: {
        const [timeValue, timeUnitDisplay] = humanizeTimeValue(
          value,
          format.unit as TimesUnitId
        );
        return [
          `${convertValueByPrecision(
            timeValue,
            format?.precision === undefined ? 1 : format.precision
          )}`,
          timeUnitDisplay,
        ];
      }
      case FormatType.Data: {
        const [dataValue, dataUnitDisplay] = humanizeDataValue(
          value,
          format.unit as BytesUnitId
        );
        return [
          `${convertValueByPrecision(dataValue, precision)}`,
          dataUnitDisplay,
        ];
      }
      case FormatType.DataRate: {
        const [dataRateValue, dataRateUnitDisplay] = humanizeDataRateValue(
          value,
          format.unit as ByteRatesUnitId
        );
        return [
          `${convertValueByPrecision(dataRateValue, precision)}`,
          dataRateUnitDisplay,
        ];
      }
      case FormatType.None: {
        return [convertValueByPrecision(value, precision), ""];
      }
      default: {
        return [
          humanizeNumberValue(value, format.unit as ShortUnitId, precision),
          format.unit,
        ];
      }
    }
  } else {
    return [humanizeNumberValue(value), null];
  }
};
