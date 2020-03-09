import { FormatUnit } from "../../interfaces/format";

export enum DataRateFormatUnitId {
  ShortBitsPerSecond = "bits/secbps",
  ShortKilobitsPerSecond = "kilobits/secKbps",
  ShortMegabitsPerSecond = "megabits/secMbps",
  ShortGigabitsPerSecond = "gigabits/secGbps",
  ShortBytesPerSecond = "bytes/secBps",
  ShortKilobytesPerSecond = "kilobytes/secKBps",
  ShortMegabytesPerSecond = "megabytes/secMBps",
  ShortGigabytesPerSecond = "gigabytes/secGBps",
  BitsPerSecond = "bits/sec(bps)",
  KilobitsPerSecond = "kilobits/sec(Kbps)",
  MegabitsPerSecond = "megabits/sec(Mbps)",
  GigabitsPerSecond = "gigabits/sec(Gbps)",
  BytesPerSecond = "bytes/sec(Bps)",
  KilobytesPerSecond = "kilobytes/sec(KBps)",
  MegabytesPerSecond = "megabytes/sec(MBps)",
  GigabytesPerSecond = "gigabytes/sec(GBps)",
  // deperated
  bps = "bps",
  Bps = "Bps",
  KBps = "KBps",
  MBps = "MBps",
  GBps = "GBps"
}

export const dataRateFormatUnits: FormatUnit[][] = [
  [
    {
      id: DataRateFormatUnitId.ShortBitsPerSecond,
      divisor: 1,
      display: "bps"
    },
    {
      id: DataRateFormatUnitId.ShortKilobitsPerSecond,
      divisor: 1024,
      display: "Kbps"
    },
    {
      id: DataRateFormatUnitId.ShortMegabitsPerSecond,
      divisor: 1024 * 1024,
      display: "Mbps"
    },
    {
      id: DataRateFormatUnitId.ShortGigabitsPerSecond,
      divisor: 1024 * 1024 * 1024,
      display: "Gbps"
    }
  ],
  [
    {
      id: DataRateFormatUnitId.ShortBytesPerSecond,
      divisor: 8,
      display: "Bps"
    },
    {
      id: DataRateFormatUnitId.ShortKilobytesPerSecond,
      divisor: 8 * 1024,
      display: "KBps"
    },
    {
      id: DataRateFormatUnitId.ShortMegabytesPerSecond,
      divisor: 8 * 1024 * 1024,
      display: "MBps"
    },
    {
      id: DataRateFormatUnitId.ShortGigabytesPerSecond,
      divisor: 8 * 1024 * 1024 * 1024,
      display: "GBps"
    }
  ],
  [
    {
      id: DataRateFormatUnitId.BitsPerSecond,
      divisor: 1,
      display: "bps"
    },
    {
      id: DataRateFormatUnitId.KilobitsPerSecond,
      divisor: 1024,
      display: "Kbps"
    },
    {
      id: DataRateFormatUnitId.MegabitsPerSecond,
      divisor: 1024 * 1024,
      display: "Mbps"
    },
    {
      id: DataRateFormatUnitId.GigabitsPerSecond,
      divisor: 1024 * 1024 * 1024,
      display: "Gbps"
    }
  ],
  [
    {
      id: DataRateFormatUnitId.BytesPerSecond,
      divisor: 8,
      display: "Bps"
    },
    {
      id: DataRateFormatUnitId.KilobytesPerSecond,
      divisor: 8 * 1024,
      display: "KBps"
    },
    {
      id: DataRateFormatUnitId.MegabytesPerSecond,
      divisor: 8 * 1024 * 1024,
      display: "MBps"
    },
    {
      id: DataRateFormatUnitId.GigabytesPerSecond,
      divisor: 8 * 1024 * 1024 * 1024,
      display: "GBps"
    }
  ],
  // deperated
  [
    {
      id: DataRateFormatUnitId.bps,
      divisor: 1,
      display: "bps"
    },
    {
      id: DataRateFormatUnitId.Bps,
      divisor: 8,
      display: "Bps"
    },
    {
      id: DataRateFormatUnitId.KBps,
      divisor: 8 * 1024,
      display: "KBps"
    },
    {
      id: DataRateFormatUnitId.MBps,
      divisor: 8 * 1024 * 1024,
      display: "MBps"
    },
    {
      id: DataRateFormatUnitId.GBps,
      divisor: 8 * 1024 * 1024 * 1024,
      display: "GBps"
    }
  ]
];

export const dataRateFormatUnitIds = ([] as string[]).concat.apply(
  [],
  dataRateFormatUnits.map(dataRateFormatUnitGroup =>
    dataRateFormatUnitGroup.map(dataRateFormatUnit => dataRateFormatUnit.id)
  )
);
