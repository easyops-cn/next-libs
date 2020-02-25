import { Unit } from "./interface";

export const times: Unit[] = [
  {
    id: "ms",
    divisor: 1,
    display: "毫秒"
  },
  {
    id: "s",
    divisor: 1000,
    display: "秒"
  },
  {
    id: "min",
    divisor: 1000 * 60,
    display: "分"
  },
  {
    id: "hour",
    divisor: 1000 * 60 * 60,
    display: "小时"
  },
  {
    id: "day",
    divisor: 1000 * 60 * 60 * 24,
    display: "天"
  },
  {
    id: "week",
    divisor: 1000 * 60 * 60 * 24 * 7,
    display: "周"
  }
];
