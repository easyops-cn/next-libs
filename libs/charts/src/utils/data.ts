import { BytesUnitId as DataFormatUnitId } from "@libs/constants";

import { dataFormatUnits } from "../constants/format/data";

export function humanizeDataValue(
  value: number,
  unit?: DataFormatUnitId
): [number, string] {
  let baseDataUnitGroupIndex = dataFormatUnits.length - 1;
  let baseDataUnitIndex = 0;
  for (let i = 0; i < dataFormatUnits.length; ++i) {
    const dataUnitIndex = dataFormatUnits[i].findIndex(
      dataUnit => dataUnit.id === unit
    );
    if (dataUnitIndex !== -1) {
      baseDataUnitGroupIndex = i;
      baseDataUnitIndex = dataUnitIndex;
      break;
    }
  }
  const dataFormatUnitGroup = dataFormatUnits[baseDataUnitGroupIndex];

  let dataFormatUnit = dataFormatUnitGroup[baseDataUnitIndex];
  for (let i = baseDataUnitIndex + 1; i < dataFormatUnitGroup.length; ++i) {
    if (
      value /
        (dataFormatUnitGroup[i].divisor /
          dataFormatUnitGroup[baseDataUnitIndex].divisor) >=
      1
    ) {
      dataFormatUnit = dataFormatUnitGroup[i];
    } else {
      break;
    }
  }

  return [
    value /
      (dataFormatUnit.divisor / dataFormatUnitGroup[baseDataUnitIndex].divisor),
    dataFormatUnit.display
  ];
}
