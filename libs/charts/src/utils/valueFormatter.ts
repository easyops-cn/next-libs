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
} from "@next-libs/constants";

/**
 * @param value
 * @param precision
 * @param fixedPrecision 默认为 `true`，设置为 `false` 时，`1.50` 会变成 `1.5`。
 * @returns
 */
export const convertValueByPrecision = (
  value: number,
  precision?: number,
  fixedPrecision?: boolean
): string => {
  if (precision === undefined) {
    return value.toString();
  }
  const converted = value.toFixed(precision);
  if (fixedPrecision === false) {
    return (+converted).toString();
  }
  return converted;
};

export const formatValue = (
  value: number,
  format?: Format
): [string, string] => {
  if (format) {
    let { type } = format;
    if (!type) {
      if (format.unit) {
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
      } else {
        type = FormatType.None;
      }
    }

    const precision = format?.precision === undefined ? 2 : format.precision;
    const fixedPrecision = format?.fixedPrecision;

    switch (type) {
      case FormatType.Percent: {
        const percentValue = humanizePercentValue(
          value,
          format.unit as PercentUnitId
        );
        return [
          `${convertValueByPrecision(
            percentValue,
            precision,
            fixedPrecision
          )}%`,
          null,
        ];
      }
      case FormatType.Time: {
        const [timeValue, timeUnitDisplay] = humanizeTimeValue(
          value,
          format.unit as TimesUnitId
        );
        return [
          `${convertValueByPrecision(
            timeValue,
            format?.precision === undefined ? 1 : format.precision,
            fixedPrecision
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
          `${convertValueByPrecision(dataValue, precision, fixedPrecision)}`,
          dataUnitDisplay,
        ];
      }
      case FormatType.DataRate: {
        const [dataRateValue, dataRateUnitDisplay] = humanizeDataRateValue(
          value,
          format.unit as ByteRatesUnitId
        );
        return [
          `${convertValueByPrecision(
            dataRateValue,
            precision,
            fixedPrecision
          )}`,
          dataRateUnitDisplay,
        ];
      }
      case FormatType.None: {
        return [convertValueByPrecision(value, precision, fixedPrecision), ""];
      }
      default: {
        return [
          humanizeNumberValue(
            value,
            format.unit as ShortUnitId,
            precision,
            fixedPrecision
          ),
          format.unit,
        ];
      }
    }
  } else {
    return [humanizeNumberValue(value), null];
  }
};
