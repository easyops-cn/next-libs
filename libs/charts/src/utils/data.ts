import { DataFormatDisplay } from "../constants/format";
import { bytes } from "@libs/constants";

export const dataUnits = bytes;

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
