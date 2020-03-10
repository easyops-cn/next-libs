import {
  Unit as FormatUnit,
  shortBytes,
  shortBibytes,
  bytes,
  bibytes,
  deperatedBytes
} from "@libs/constants";

export const dataFormatUnits: FormatUnit[][] = [
  shortBytes,
  shortBibytes,
  bytes,
  bibytes,
  // deperated
  deperatedBytes
];

export const dataFormatUnitIds = ([] as string[]).concat.apply(
  [],
  dataFormatUnits.map(dataFormatUnitGroup =>
    dataFormatUnitGroup.map(dataFormatUnit => dataFormatUnit.id)
  )
);
