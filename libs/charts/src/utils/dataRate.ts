import { ByteRatesUnitId as DataRateFormatUnitId } from "@next-libs/constants";

import { dataRateFormatUnits } from "../constants/format/dataRate";

export function humanizeDataRateValue(
  value: number,
  unit?: DataRateFormatUnitId
): [number, string] {
  let baseDataRateUnitGroupIndex = dataRateFormatUnits.length - 1;
  let baseDataRateUnitIndex = 0;
  const sign = Math.sign(value);
  const positiveValue = Math.abs(value);

  if (unit) {
    for (let i = 0; i < dataRateFormatUnits.length; ++i) {
      const dataRateUnitIndex = dataRateFormatUnits[i].findIndex(
        (dataRateUnit) =>
          dataRateUnit.id.toLocaleLowerCase() === unit.toLocaleLowerCase() ||
          (dataRateUnit.alias &&
            dataRateUnit.alias
              .map((alias) => alias.toLocaleLowerCase())
              .includes(unit))
      );
      if (dataRateUnitIndex !== -1) {
        baseDataRateUnitGroupIndex = i;
        baseDataRateUnitIndex = dataRateUnitIndex;
        break;
      }
    }
  }
  const dataRateFormatUnitGroup =
    dataRateFormatUnits[baseDataRateUnitGroupIndex];

  let dataRateFormatUnit = dataRateFormatUnitGroup[baseDataRateUnitIndex];
  for (
    let i = baseDataRateUnitIndex + 1;
    i < dataRateFormatUnitGroup.length;
    ++i
  ) {
    if (
      positiveValue /
        (dataRateFormatUnitGroup[i].divisor /
          dataRateFormatUnitGroup[baseDataRateUnitIndex].divisor) >=
      1
    ) {
      dataRateFormatUnit = dataRateFormatUnitGroup[i];
    } else {
      break;
    }
  }

  return [
    (positiveValue /
      (dataRateFormatUnit.divisor /
        dataRateFormatUnitGroup[baseDataRateUnitIndex].divisor)) *
      sign,
    dataRateFormatUnit.display,
  ];
}
