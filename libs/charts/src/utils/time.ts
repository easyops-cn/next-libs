import { TimeFormatUnitId, timeFormatUnits } from "../constants/format/time";

export function humanizeTimeValue(
  value: number,
  unit?: TimeFormatUnitId
): [number, string] {
  let baseTimeUnitGroupIndex = 0;
  let baseTimeUnitIndex = 2;
  for (let i = 0; i < timeFormatUnits.length; ++i) {
    const timeUnitIndex = timeFormatUnits[i].findIndex(
      timeUnit => timeUnit.id === unit
    );
    if (timeUnitIndex !== -1) {
      baseTimeUnitGroupIndex = i;
      baseTimeUnitIndex = timeUnitIndex;
      break;
    }
  }
  const timeFormatUnitGroup = timeFormatUnits[baseTimeUnitGroupIndex];

  let timeFormatUnit = timeFormatUnitGroup[baseTimeUnitIndex];
  for (let i = baseTimeUnitIndex + 1; i < timeFormatUnitGroup.length; ++i) {
    if (
      value /
        (timeFormatUnitGroup[i].divisor /
          timeFormatUnitGroup[baseTimeUnitIndex].divisor) >=
      1
    ) {
      timeFormatUnit = timeFormatUnitGroup[i];
    } else {
      break;
    }
  }

  return [
    value /
      (timeFormatUnit.divisor / timeFormatUnitGroup[baseTimeUnitIndex].divisor),
    timeFormatUnit.display
  ];
}
