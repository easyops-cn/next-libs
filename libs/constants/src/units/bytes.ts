import { Unit } from "./interface";

export const bytes: Unit[] = [
  {
    id: "b",
    divisor: 1,
    display: "b"
  },
  {
    id: "B",
    divisor: 8,
    display: "B"
  },
  {
    id: "KB",
    divisor: 8 * 1024,
    display: "KB"
  },
  {
    id: "MB",
    divisor: 8 * 1024 * 1024,
    display: "MB"
  },
  {
    id: "GB",
    divisor: 8 * 1024 * 1024 * 1024,
    display: "GB"
  }
];
