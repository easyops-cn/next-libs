import { Unit } from "./interface";

export enum BytesUnitId {
  ShortBytes = "bytesB",
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
  // deperated
  b = "b",
  B = "B",
  KB = "KB",
  MB = "MB",
  GB = "GB"
}

export const shortBytes: Unit[] = [
  {
    id: BytesUnitId.ShortBytes,
    divisor: 1,
    display: "B"
  },
  {
    id: BytesUnitId.ShortKilobytes,
    divisor: 1024,
    display: "KB"
  },
  {
    id: BytesUnitId.ShortMegabytes,
    divisor: 1024 * 1024,
    display: "MB"
  },
  {
    id: BytesUnitId.ShortGigabytes,
    divisor: 1024 * 1024 * 1024,
    display: "GB"
  },
  {
    id: BytesUnitId.ShortTerabytes,
    divisor: 1024 * 1024 * 1024 * 1024,
    display: "TB"
  },
  {
    id: BytesUnitId.ShortPetabytes,
    divisor: 1024 * 1024 * 1024 * 1024 * 1024,
    display: "PB"
  }
];

export const shortBibytes: Unit[] = [
  {
    id: BytesUnitId.ShortBibytes,
    divisor: 1,
    display: "B"
  },
  {
    id: BytesUnitId.ShortKibibytes,
    divisor: 1000,
    display: "KiB"
  },
  {
    id: BytesUnitId.ShortMebibytes,
    divisor: 1000 * 1000,
    display: "MiB"
  },
  {
    id: BytesUnitId.ShortGibibytes,
    divisor: 1000 * 1000 * 1000,
    display: "GiB"
  },
  {
    id: BytesUnitId.ShortTebibytes,
    divisor: 1000 * 1000 * 1000 * 1000,
    display: "TiB"
  },
  {
    id: BytesUnitId.ShortPebibytes,
    divisor: 1000 * 1000 * 1000 * 1000 * 1000,
    display: "PiB"
  }
];

export const bytes: Unit[] = [
  {
    id: BytesUnitId.Bytes,
    divisor: 1,
    display: "B"
  },
  {
    id: BytesUnitId.Kilobytes,
    divisor: 1024,
    display: "KB"
  },
  {
    id: BytesUnitId.Megabytes,
    divisor: 1024 * 1024,
    display: "MB"
  },
  {
    id: BytesUnitId.Gigabytes,
    divisor: 1024 * 1024 * 1024,
    display: "GB"
  },
  {
    id: BytesUnitId.Terabytes,
    divisor: 1024 * 1024 * 1024 * 1024,
    display: "TB"
  },
  {
    id: BytesUnitId.Petabytes,
    divisor: 1024 * 1024 * 1024 * 1024 * 1024,
    display: "PB"
  }
];

export const bibytes: Unit[] = [
  {
    id: BytesUnitId.Bibytes,
    divisor: 1,
    display: "B"
  },
  {
    id: BytesUnitId.Kibibytes,
    divisor: 1000,
    display: "KiB"
  },
  {
    id: BytesUnitId.Mebibytes,
    divisor: 1000 * 1000,
    display: "MiB"
  },
  {
    id: BytesUnitId.Gibibytes,
    divisor: 1000 * 1000 * 1000,
    display: "GiB"
  },
  {
    id: BytesUnitId.Tebibytes,
    divisor: 1000 * 1000 * 1000 * 1000,
    display: "TiB"
  },
  {
    id: BytesUnitId.Pebibytes,
    divisor: 1000 * 1000 * 1000 * 1000 * 1000,
    display: "PiB"
  }
];

export const deperatedBytes: Unit[] = [
  {
    id: BytesUnitId.b,
    divisor: 1,
    display: "b"
  },
  {
    id: BytesUnitId.B,
    divisor: 8,
    display: "B"
  },
  {
    id: BytesUnitId.KB,
    divisor: 8 * 1024,
    display: "KB"
  },
  {
    id: BytesUnitId.MB,
    divisor: 8 * 1024 * 1024,
    display: "MB"
  },
  {
    id: BytesUnitId.GB,
    divisor: 8 * 1024 * 1024 * 1024,
    display: "GB"
  }
];
