import { FormatUnit } from "../../interfaces/format";

export enum DataFormatUnitId {
  ShortKilobytes = "kilobytesKB",
  ShortMegabytes = "megabytesMB",
  ShortGigabytes = "gigabytesGB",
  ShortTerabytes = "terabytesTB",
  ShortPetabytes = "petabytesPB",
  ShortBibytes = "bibytesB",
  ShortKibibytes = "kibibytesKiB",
  ShortMebibytes = "mebibytesMiB",
  ShortGibibytes = "gibibytesGiB",
  ShortTebibytes = "tebibytesTiB",
  ShortPebibytes = "pebibytesPiB",
  Bytes = "bytes(B)",
  Kilobytes = "kilobytes(KB)",
  Megabytes = "megabytes(MB)",
  Gigabytes = "gigabytes(GB)",
  Terabytes = "terabytes(TB)",
  Petabytes = "petabytes(PB)",
  Bibytes = "bibytes(B)",
  Kibibytes = "kibibytes(KiB)",
  Mebibytes = "mebibytes(MiB)",
  Gibibytes = "gibibytes(GiB)",
  Tebibytes = "tebibytes(TiB)",
  Pebibytes = "pebibytes(PiB)",
  ShortBytes = "bytes(B)",
  // deperated
  b = "b",
  B = "B",
  KB = "KB",
  MB = "MB",
  GB = "GB"
}

export const dataFormatUnits: FormatUnit[][] = [
  [
    {
      id: DataFormatUnitId.ShortBytes,
      divisor: 1,
      display: "B"
    },
    {
      id: DataFormatUnitId.ShortKilobytes,
      divisor: 1024,
      display: "KB"
    },
    {
      id: DataFormatUnitId.ShortMegabytes,
      divisor: 1024 * 1024,
      display: "MB"
    },
    {
      id: DataFormatUnitId.ShortGigabytes,
      divisor: 1024 * 1024 * 1024,
      display: "GB"
    },
    {
      id: DataFormatUnitId.ShortTerabytes,
      divisor: 1024 * 1024 * 1024 * 1024,
      display: "TB"
    },
    {
      id: DataFormatUnitId.ShortPetabytes,
      divisor: 1024 * 1024 * 1024 * 1024 * 1024,
      display: "PB"
    }
  ],
  [
    {
      id: DataFormatUnitId.ShortBibytes,
      divisor: 1,
      display: "B"
    },
    {
      id: DataFormatUnitId.ShortKibibytes,
      divisor: 1000,
      display: "KiB"
    },
    {
      id: DataFormatUnitId.ShortMebibytes,
      divisor: 1000 * 1000,
      display: "MiB"
    },
    {
      id: DataFormatUnitId.ShortGibibytes,
      divisor: 1000 * 1000 * 1000,
      display: "GiB"
    },
    {
      id: DataFormatUnitId.ShortTebibytes,
      divisor: 1000 * 1000 * 1000 * 1000,
      display: "TiB"
    },
    {
      id: DataFormatUnitId.ShortPebibytes,
      divisor: 1000 * 1000 * 1000 * 1000 * 1000,
      display: "PiB"
    }
  ],
  [
    {
      id: DataFormatUnitId.Bytes,
      divisor: 1,
      display: "B"
    },
    {
      id: DataFormatUnitId.Kilobytes,
      divisor: 1024,
      display: "KB"
    },
    {
      id: DataFormatUnitId.Megabytes,
      divisor: 1024 * 1024,
      display: "MB"
    },
    {
      id: DataFormatUnitId.Gigabytes,
      divisor: 1024 * 1024 * 1024,
      display: "GB"
    },
    {
      id: DataFormatUnitId.Terabytes,
      divisor: 1024 * 1024 * 1024 * 1024,
      display: "TB"
    },
    {
      id: DataFormatUnitId.Petabytes,
      divisor: 1024 * 1024 * 1024 * 1024 * 1024,
      display: "PB"
    }
  ],
  [
    {
      id: DataFormatUnitId.Bibytes,
      divisor: 1,
      display: "B"
    },
    {
      id: DataFormatUnitId.Kibibytes,
      divisor: 1000,
      display: "KiB"
    },
    {
      id: DataFormatUnitId.Mebibytes,
      divisor: 1000 * 1000,
      display: "MiB"
    },
    {
      id: DataFormatUnitId.Gibibytes,
      divisor: 1000 * 1000 * 1000,
      display: "GiB"
    },
    {
      id: DataFormatUnitId.Tebibytes,
      divisor: 1000 * 1000 * 1000 * 1000,
      display: "TiB"
    },
    {
      id: DataFormatUnitId.Pebibytes,
      divisor: 1000 * 1000 * 1000 * 1000 * 1000,
      display: "PiB"
    }
  ],
  // deperated
  [
    {
      id: DataFormatUnitId.b,
      divisor: 1,
      display: "b"
    },
    {
      id: DataFormatUnitId.B,
      divisor: 8,
      display: "B"
    },
    {
      id: DataFormatUnitId.KB,
      divisor: 8 * 1024,
      display: "KB"
    },
    {
      id: DataFormatUnitId.MB,
      divisor: 8 * 1024 * 1024,
      display: "MB"
    },
    {
      id: DataFormatUnitId.GB,
      divisor: 8 * 1024 * 1024 * 1024,
      display: "GB"
    }
  ]
];

export const dataFormatUnitIds = ([] as string[]).concat.apply(
  [],
  dataFormatUnits.map(dataFormatUnitGroup =>
    dataFormatUnitGroup.map(dataFormatUnit => dataFormatUnit.id)
  )
);
