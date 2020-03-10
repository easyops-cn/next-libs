import {
  Unit as FormatUnit,
  shortBitRates,
  shortByteRates,
  bitRates,
  byteRates,
  deperatedByteRates
} from "@libs/constants";

export const dataRateFormatUnits: FormatUnit[][] = [
  shortBitRates,
  shortByteRates,
  bitRates,
  byteRates,
  // deperated
  deperatedByteRates
];

export const dataRateFormatUnitIds = ([] as string[]).concat.apply(
  [],
  dataRateFormatUnits.map(dataRateFormatUnitGroup =>
    dataRateFormatUnitGroup.map(dataRateFormatUnit => dataRateFormatUnit.id)
  )
);
