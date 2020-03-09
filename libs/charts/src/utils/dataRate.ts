import {
  DataRateFormatUnitId,
  dataRateFormatUnits
} from "../constants/format/dataRate";

export function humanizeDataRateValue(
  value: number,
  unit?: DataRateFormatUnitId
): [number, string] {
  let baseDataRateUnitGroupIndex = dataRateFormatUnits.length - 1;
  let baseDataRateUnitIndex = 0;
  for (let i = 0; i < dataRateFormatUnits.length; ++i) {
    const dataRateUnitIndex = dataRateFormatUnits[i].findIndex(
      dataRateUnit => dataRateUnit.id === unit
    );
    if (dataRateUnitIndex !== -1) {
      baseDataRateUnitGroupIndex = i;
      baseDataRateUnitIndex = dataRateUnitIndex;
      break;
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
      value /
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
    value /
      (dataRateFormatUnit.divisor /
        dataRateFormatUnitGroup[baseDataRateUnitIndex].divisor),
    dataRateFormatUnit.display
  ];
}
