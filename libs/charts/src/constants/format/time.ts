import { Unit as FormatUnit, times } from "@next-libs/constants";

export const timeFormatUnits: FormatUnit[][] = [times];

export const timeFormatUnitIds = ([] as string[]).concat.apply(
  [],
  timeFormatUnits.map((timeFormatUnitGroup) => [
    ...timeFormatUnitGroup.map((timeFormatUnit) => timeFormatUnit.id),
    ...([] as string[]).concat.apply(
      [],
      timeFormatUnitGroup.map((timeFormatUnit) =>
        timeFormatUnit.alias ? timeFormatUnit.alias : []
      )
    ),
  ])
);
