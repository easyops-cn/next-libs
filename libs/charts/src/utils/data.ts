import { DataFormatDisplay } from "../constants/format/data";

export const dataUnits = [
  {
    divisor: 1,
    display: DataFormatDisplay.BITS
  },
  {
    divisor: 8,
    display: DataFormatDisplay.BYTES
  },
  {
    divisor: 8 * 1024,
    display: DataFormatDisplay.KILOBYTES
  },
  {
    divisor: 8 * 1024 * 1024,
    display: DataFormatDisplay.MEGABYTES
  },
  {
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
    dataUnit.display
  ];
}
