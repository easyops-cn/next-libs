import { BytesUnitId as DataFormatUnitId } from "@next-libs/constants";

import { dataFormatUnits } from "../constants/format/data";

export function humanizeDataValue(
  value: number,
  unit?: DataFormatUnitId
): [number, string] {
  let baseDataUnitGroupIndex = dataFormatUnits.length - 1;
  let baseDataUnitIndex = 0;

  if (unit) {
    for (let i = 0; i < dataFormatUnits.length; ++i) {
      const dataUnitIndex = dataFormatUnits[i].findIndex(
        (dataUnit) =>
          dataUnit.id.toLocaleLowerCase() === unit.toLocaleLowerCase() ||
          (dataUnit.alias &&
            dataUnit.alias
              .map((alias) => alias.toLocaleLowerCase())
              .includes(unit))
      );
      if (dataUnitIndex !== -1) {
        baseDataUnitGroupIndex = i;
        baseDataUnitIndex = dataUnitIndex;
        break;
      }
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
    dataFormatUnit.display,
  ];
}
