import { Unit as FormatUnit, shortTimes, times } from "@libs/constants";

export const timeFormatUnits: FormatUnit[][] = [shortTimes, times];

export const timeFormatUnitIds = ([] as string[]).concat.apply(
  [],
  timeFormatUnits.map(timeFormatUnitGroup =>
    timeFormatUnitGroup.map(timeFormatUnit => timeFormatUnit.id)
  )
);
