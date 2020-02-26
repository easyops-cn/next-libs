import { Unit } from "./interface";

export const byteRates: Unit[] = [
  {
    id: "bps",
    divisor: 1,
    display: "bps"
  },
  {
    id: "Bps",
    divisor: 8,
    display: "Bps"
  },
  {
    id: "KBps",
    divisor: 8 * 1024,
    display: "KBps"
  },
  {
    id: "MBps",
    divisor: 8 * 1024 * 1024,
    display: "MBps"
  },
  {
    id: "GBps",
    divisor: 8 * 1024 * 1024 * 1024,
    display: "GBps"
  }
];
