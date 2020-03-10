import { PercentUnitId as PercentFormatUnitId } from "@libs/constants";

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
