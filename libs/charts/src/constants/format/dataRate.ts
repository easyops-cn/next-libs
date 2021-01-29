import {
  Unit as FormatUnit,
  bitRates,
  byteRates,
  deprecatedByteRates,
} from "@next-libs/constants";

export const dataRateFormatUnits: FormatUnit[][] = [
  bitRates,
  byteRates,
  // deprecated
  deprecatedByteRates,
];

export const dataRateFormatUnitIds = ([] as string[]).concat.apply(
  [],
  dataRateFormatUnits.map((dataRateFormatUnitGroup) => [
    ...dataRateFormatUnitGroup.map(
      (dataRateFormatUnit) => dataRateFormatUnit.id
    ),
    ...([] as string[]).concat.apply(
      [],
      dataRateFormatUnitGroup.map((dataRateFormatUnit) =>
        dataRateFormatUnit.alias ? dataRateFormatUnit.alias : []
      )
    ),
  ])
);
