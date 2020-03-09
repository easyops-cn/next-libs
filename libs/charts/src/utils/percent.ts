import { PercentFormatUnitId } from "../constants/format/percent";

export function humanizePercentValue(
  value: number,
  unit?: PercentFormatUnitId
): number {
  switch (unit) {
    case PercentFormatUnitId.Percent100:
      return value;
    default:
      return value * 100;
  }
}
