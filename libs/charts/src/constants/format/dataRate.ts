import {
  Unit as FormatUnit,
  bitRates,
  byteRates,
  deperatedByteRates
} from "@libs/constants";

export const dataRateFormatUnits: FormatUnit[][] = [
  bitRates,
  byteRates,
  // deperated
  deperatedByteRates
];

export const dataRateFormatUnitIds = ([] as string[]).concat.apply(
  [],
  dataRateFormatUnits.map(dataRateFormatUnitGroup => [
    ...dataRateFormatUnitGroup.map(dataRateFormatUnit => dataRateFormatUnit.id),
    ...([] as string[]).concat.apply(
      [],
      dataRateFormatUnitGroup.map(dataRateFormatUnit =>
        dataRateFormatUnit.alias ? dataRateFormatUnit.alias : []
      )
    )
  ])
);
