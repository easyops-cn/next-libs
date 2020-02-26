import { DataRateFormatDisplay } from "../constants/format";
import { byteRates } from "@libs/constants";

export const dataRateUnits = byteRates;

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
