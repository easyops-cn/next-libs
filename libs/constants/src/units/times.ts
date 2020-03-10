import { Unit } from "./interface";

export enum TimesUnitId {
  ShortNanosecond = "nanosecondsns",
  ShortMicrosecond = "microsecondsμs",
  ShortMilliseconds = "millisecondsms",
  ShortSeconds = "secondss",
  ShortMinutes = "minutesm",
  ShortHours = "hoursh",
  ShortDays = "daysd",
  ShortWeeks = "weeksw",
  Nanosecond = "nanoseconds(ns)",
  Microsecond = "microseconds(μs)",
  Milliseconds = "milliseconds(ms)",
  Seconds = "seconds(s)",
  Minutes = "minutes(m)",
  Hours = "hours(h)",
  Days = "days(d)",
  Weeks = "weeks(w)",
  // deperated
  ms = "ms",
  s = "s",
  min = "min",
  hour = "hour",
  day = "day",
  week = "week"
}

export const shortTimes: Unit[] = [
  {
    id: TimesUnitId.ShortNanosecond,
    divisor: 1,
    display: "ns"
  },
  {
    id: TimesUnitId.ShortMicrosecond,
    divisor: 1000,
    display: "μs"
  },
  {
    id: TimesUnitId.ShortMilliseconds,
    divisor: 1000 * 1000,
    display: "ms"
  },
  {
    id: TimesUnitId.ShortSeconds,
    divisor: 1000 * 1000 * 1000,
    display: "s"
  },
  {
    id: TimesUnitId.ShortMinutes,
    divisor: 1000 * 1000 * 1000 * 60,
    display: "m"
  },
  {
    id: TimesUnitId.ShortHours,
    divisor: 1000 * 1000 * 1000 * 60 * 60,
    display: "h"
  },
  {
    id: TimesUnitId.ShortDays,
    divisor: 1000 * 1000 * 1000 * 60 * 60 * 24,
    display: "d"
  },
  {
    id: TimesUnitId.ShortWeeks,
    divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 7,
    display: "w"
  }
];

export const times: Unit[] = [
  {
    id: TimesUnitId.Nanosecond,
    divisor: 1,
    display: "ns"
  },
  {
    id: TimesUnitId.Microsecond,
    divisor: 1000,
    display: "μs"
  },
  {
    id: TimesUnitId.Milliseconds,
    divisor: 1000 * 1000,
    display: "ms"
  },
  {
    id: TimesUnitId.Seconds,
    divisor: 1000 * 1000 * 1000,
    display: "s"
  },
  {
    id: TimesUnitId.Minutes,
    divisor: 1000 * 1000 * 1000 * 60,
    display: "m"
  },
  {
    id: TimesUnitId.Hours,
    divisor: 1000 * 1000 * 1000 * 60 * 60,
    display: "h"
  },
  {
    id: TimesUnitId.Days,
    divisor: 1000 * 1000 * 1000 * 60 * 60 * 24,
    display: "d"
  },
  {
    id: TimesUnitId.Weeks,
    divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 7,
    display: "w"
  }
];

export const deperatedTimes: Unit[] = [
  {
    id: TimesUnitId.ms,
    divisor: 1,
    display: "毫秒"
  },
  {
    id: TimesUnitId.s,
    divisor: 1000,
    display: "秒"
  },
  {
    id: TimesUnitId.min,
    divisor: 1000 * 60,
    display: "分"
  },
  {
    id: TimesUnitId.hour,
    divisor: 1000 * 60 * 60,
    display: "小时"
  },
  {
    id: TimesUnitId.day,
    divisor: 1000 * 60 * 60 * 24,
    display: "天"
  },
  {
    id: TimesUnitId.week,
    divisor: 1000 * 60 * 60 * 24 * 7,
    display: "周"
  }
];
