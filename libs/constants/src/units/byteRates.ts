import { Unit } from "./interface";

export enum ByteRatesUnitId {
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

export const shortBitRates: Unit[] = [
  {
    id: ByteRatesUnitId.ShortBitsPerSecond,
    divisor: 1,
    display: "bps"
  },
  {
    id: ByteRatesUnitId.ShortKilobitsPerSecond,
    divisor: 1024,
    display: "Kbps"
  },
  {
    id: ByteRatesUnitId.ShortMegabitsPerSecond,
    divisor: 1024 * 1024,
    display: "Mbps"
  },
  {
    id: ByteRatesUnitId.ShortGigabitsPerSecond,
    divisor: 1024 * 1024 * 1024,
    display: "Gbps"
  }
];

export const shortByteRates: Unit[] = [
  {
    id: ByteRatesUnitId.ShortBytesPerSecond,
    divisor: 8,
    display: "Bps"
  },
  {
    id: ByteRatesUnitId.ShortKilobytesPerSecond,
    divisor: 8 * 1024,
    display: "KBps"
  },
  {
    id: ByteRatesUnitId.ShortMegabytesPerSecond,
    divisor: 8 * 1024 * 1024,
    display: "MBps"
  },
  {
    id: ByteRatesUnitId.ShortGigabytesPerSecond,
    divisor: 8 * 1024 * 1024 * 1024,
    display: "GBps"
  }
];

export const bitRates: Unit[] = [
  {
    id: ByteRatesUnitId.BitsPerSecond,
    divisor: 1,
    display: "bps"
  },
  {
    id: ByteRatesUnitId.KilobitsPerSecond,
    divisor: 1024,
    display: "Kbps"
  },
  {
    id: ByteRatesUnitId.MegabitsPerSecond,
    divisor: 1024 * 1024,
    display: "Mbps"
  },
  {
    id: ByteRatesUnitId.GigabitsPerSecond,
    divisor: 1024 * 1024 * 1024,
    display: "Gbps"
  }
];

export const byteRates: Unit[] = [
  {
    id: ByteRatesUnitId.BytesPerSecond,
    divisor: 8,
    display: "Bps"
  },
  {
    id: ByteRatesUnitId.KilobytesPerSecond,
    divisor: 8 * 1024,
    display: "KBps"
  },
  {
    id: ByteRatesUnitId.MegabytesPerSecond,
    divisor: 8 * 1024 * 1024,
    display: "MBps"
  },
  {
    id: ByteRatesUnitId.GigabytesPerSecond,
    divisor: 8 * 1024 * 1024 * 1024,
    display: "GBps"
  }
];

export const deperatedByteRates: Unit[] = [
  {
    id: ByteRatesUnitId.bps,
    divisor: 1,
    display: "bps"
  },
  {
    id: ByteRatesUnitId.Bps,
    divisor: 8,
    display: "Bps"
  },
  {
    id: ByteRatesUnitId.KBps,
    divisor: 8 * 1024,
    display: "KBps"
  },
  {
    id: ByteRatesUnitId.MBps,
    divisor: 8 * 1024 * 1024,
    display: "MBps"
  },
  {
    id: ByteRatesUnitId.GBps,
    divisor: 8 * 1024 * 1024 * 1024,
    display: "GBps"
  }
];
