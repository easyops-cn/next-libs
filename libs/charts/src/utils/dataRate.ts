import { DataRateFormatDisplay } from "../constants/format";
import { Unit } from "./interface";

export const dataRateUnits: Unit[] = [
  {
    id: DataRateFormatDisplay.BITS_PER_SECOND,
    divisor: 1,
    display: DataRateFormatDisplay.BITS_PER_SECOND
  },
  {
    id: DataRateFormatDisplay.BYTES_PER_SECOND,
    divisor: 8,
    display: DataRateFormatDisplay.BYTES_PER_SECOND
  },
  {
    id: DataRateFormatDisplay.KILOBYTES_PER_SECOND,
    divisor: 8 * 1024,
    display: DataRateFormatDisplay.KILOBYTES_PER_SECOND
  },
  {
    id: DataRateFormatDisplay.MEGABYTES_PER_SECOND,
    divisor: 8 * 1024 * 1024,
    display: DataRateFormatDisplay.MEGABYTES_PER_SECOND
  },
  {
    id: DataRateFormatDisplay.GIGABYTES_PER_SECOND,
    divisor: 8 * 1024 * 1024 * 1024,
    display: DataRateFormatDisplay.GIGABYTES_PER_SECOND
  }
];

export function humanizeDataRateValue(
  value: number,
  unit?: string
): [number, DataRateFormatDisplay] {
  let baseDataRateUnitIndex = dataRateUnits.findIndex(
    dataRateUnit => dataRateUnit.display === unit
  );
  if (baseDataRateUnitIndex === -1) {
    baseDataRateUnitIndex = 0;
  }

  let dataRateUnit = dataRateUnits[baseDataRateUnitIndex];
  for (let i = baseDataRateUnitIndex + 1; i < dataRateUnits.length; ++i) {
    if (
      value /
        (dataRateUnits[i].divisor /
          dataRateUnits[baseDataRateUnitIndex].divisor) >=
      1
    ) {
      dataRateUnit = dataRateUnits[i];
    } else {
      break;
    }
  }

  return [
    value /
      (dataRateUnit.divisor / dataRateUnits[baseDataRateUnitIndex].divisor),
    dataRateUnit.display as DataRateFormatDisplay
  ];
}
