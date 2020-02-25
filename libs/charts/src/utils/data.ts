import { DataFormatDisplay } from "../constants/format";
import { Unit } from "./interface";

export const dataUnits: Unit[] = [
  {
    id: DataFormatDisplay.BITS,
    divisor: 1,
    display: DataFormatDisplay.BITS
  },
  {
    id: DataFormatDisplay.BYTES,
    divisor: 8,
    display: DataFormatDisplay.BYTES
  },
  {
    id: DataFormatDisplay.KILOBYTES,
    divisor: 8 * 1024,
    display: DataFormatDisplay.KILOBYTES
  },
  {
    id: DataFormatDisplay.MEGABYTES,
    divisor: 8 * 1024 * 1024,
    display: DataFormatDisplay.MEGABYTES
  },
  {
    id: DataFormatDisplay.GIGABYTES,
    divisor: 8 * 1024 * 1024 * 1024,
    display: DataFormatDisplay.GIGABYTES
  }
];

export function humanizeDataValue(
  value: number,
  unit?: string
): [number, DataFormatDisplay] {
  let baseDataUnitIndex = dataUnits.findIndex(
    dataUnit => dataUnit.display === unit
  );
  if (baseDataUnitIndex === -1) {
    baseDataUnitIndex = 0;
  }

  let dataUnit = dataUnits[baseDataUnitIndex];
  for (let i = baseDataUnitIndex + 1; i < dataUnits.length; ++i) {
    if (
      value / (dataUnits[i].divisor / dataUnits[baseDataUnitIndex].divisor) >=
      1
    ) {
      dataUnit = dataUnits[i];
    } else {
      break;
    }
  }

  return [
    value / (dataUnit.divisor / dataUnits[baseDataUnitIndex].divisor),
    dataUnit.display as DataFormatDisplay
  ];
}
