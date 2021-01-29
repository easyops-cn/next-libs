import {
  Unit as FormatUnit,
  bytes,
  bibytes,
  deprecatedBytes,
} from "@next-libs/constants";

export const dataFormatUnits: FormatUnit[][] = [
  bytes,
  bibytes,
  // deprecated
  deprecatedBytes,
];

export const dataFormatUnitIds = ([] as string[]).concat.apply(
  [],
  dataFormatUnits.map((dataFormatUnitGroup) => [
    ...dataFormatUnitGroup.map((dataFormatUnit) => dataFormatUnit.id),
    ...([] as string[]).concat.apply(
      [],
      dataFormatUnitGroup.map((dataFormatUnit) =>
        dataFormatUnit.alias ? dataFormatUnit.alias : []
      )
    ),
  ])
);
