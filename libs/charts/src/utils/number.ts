import { ShortUnitId, numberFormatUnits } from "@next-libs/constants";

/**
 *
 * @param value
 * @param unit
 * @param precision
 * @param fixedPrecision 默认为 true
 * @returns
 */
export const humanizeNumberValue = (
  value: number,
  unit?: ShortUnitId,
  precision?: number,
  fixedPrecision?: boolean
): string => {
  let baseNumberUnitIndex = 0;
  const sign = Math.sign(value);
  const positiveValue = Math.abs(value);
  if (unit) {
    const numberUnitIndex = numberFormatUnits.findIndex(
      (numberUnit) =>
        numberUnit.id.toLocaleLowerCase() === unit.toLocaleLowerCase()
    );
    if (numberUnitIndex !== -1) {
      baseNumberUnitIndex = numberUnitIndex;
    }
  }

  let numberFormatUnit = numberFormatUnits[baseNumberUnitIndex];
  for (let i = baseNumberUnitIndex + 1; i < numberFormatUnits.length; ++i) {
    if (
      positiveValue /
        (numberFormatUnits[i].divisor /
          numberFormatUnits[baseNumberUnitIndex].divisor) >=
      1
    ) {
      numberFormatUnit = numberFormatUnits[i];
    } else {
      break;
    }
  }

  if (numberFormatUnit.id === ShortUnitId.None) {
    return convertFixedPrecision(
      (sign * positiveValue).toFixed(precision ?? 2),
      fixedPrecision
    );
  } else {
    return (
      convertFixedPrecision(
        (
          (positiveValue /
            (numberFormatUnit.divisor /
              numberFormatUnits[baseNumberUnitIndex].divisor)) *
          sign
        ).toFixed(precision ?? 2),
        fixedPrecision
      ) + numberFormatUnit.display
    );
  }
};

/**
 *
 * @param value
 * @param fixedPrecision 默认为 true
 * @returns
 */
export function convertFixedPrecision(
  value: string,
  fixedPrecision?: boolean
): string {
  if (fixedPrecision === false) {
    return (+value).toString();
  }
  return value;
}
