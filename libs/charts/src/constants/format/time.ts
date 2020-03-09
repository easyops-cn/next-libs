import { FormatUnit } from "../../interfaces/format";

export enum TimeFormatUnitId {
  ShortNanosecond = "nanosecondsns",
  ShortMicrosecond = "microsecondsμs",
  ShortMilliseconds = "millisecondsms",
  ShortSeconds = "secondss",
  ShortMinutes = "minutesm",
  ShortHours = "hoursh",
  ShortDays = "daysd",
  ShortWeeks = "weeksw",
  ShortMonths = "monthsM",
  ShortYears = "yearsy",
  Nanosecond = "nanoseconds(ns)",
  Microsecond = "microseconds(μs)",
  Milliseconds = "milliseconds(ms)",
  Seconds = "seconds(s)",
  Minutes = "minutes(m)",
  Hours = "hours(h)",
  Days = "days(d)",
  Weeks = "weeks(w)",
  Months = "months(M)",
  Years = "years(y)"
}

export const timeFormatUnits: FormatUnit[][] = [
  [
    {
      id: TimeFormatUnitId.ShortNanosecond,
      divisor: 1,
      display: "ns"
    },
    {
      id: TimeFormatUnitId.ShortMicrosecond,
      divisor: 1000,
      display: "μs"
    },
    {
      id: TimeFormatUnitId.ShortMilliseconds,
      divisor: 1000 * 1000,
      display: "ms"
    },
    {
      id: TimeFormatUnitId.ShortSeconds,
      divisor: 1000 * 1000 * 1000,
      display: "s"
    },
    {
      id: TimeFormatUnitId.ShortMinutes,
      divisor: 1000 * 1000 * 1000 * 60,
      display: "m"
    },
    {
      id: TimeFormatUnitId.ShortHours,
      divisor: 1000 * 1000 * 1000 * 60 * 60,
      display: "h"
    },
    {
      id: TimeFormatUnitId.ShortDays,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24,
      display: "d"
    },
    {
      id: TimeFormatUnitId.ShortWeeks,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 7,
      display: "w"
    },
    {
      id: TimeFormatUnitId.ShortMonths,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 4,
      display: "M"
    },
    {
      id: TimeFormatUnitId.ShortYears,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 365,
      display: "y"
    }
  ],
  [
    {
      id: TimeFormatUnitId.Nanosecond,
      divisor: 1,
      display: "ns"
    },
    {
      id: TimeFormatUnitId.Microsecond,
      divisor: 1000,
      display: "μs"
    },
    {
      id: TimeFormatUnitId.Milliseconds,
      divisor: 1000 * 1000,
      display: "ms"
    },
    {
      id: TimeFormatUnitId.Seconds,
      divisor: 1000 * 1000 * 1000,
      display: "s"
    },
    {
      id: TimeFormatUnitId.Minutes,
      divisor: 1000 * 1000 * 1000 * 60,
      display: "m"
    },
    {
      id: TimeFormatUnitId.Hours,
      divisor: 1000 * 1000 * 1000 * 60 * 60,
      display: "h"
    },
    {
      id: TimeFormatUnitId.Days,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24,
      display: "d"
    },
    {
      id: TimeFormatUnitId.Weeks,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 7,
      display: "w"
    },
    {
      id: TimeFormatUnitId.Months,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 4,
      display: "M"
    },
    {
      id: TimeFormatUnitId.Years,
      divisor: 1000 * 1000 * 1000 * 60 * 60 * 24 * 365,
      display: "y"
    }
  ]
];

export const timeFormatUnitIds = ([] as string[]).concat.apply(
  [],
  timeFormatUnits.map(timeFormatUnitGroup =>
    timeFormatUnitGroup.map(timeFormatUnit => timeFormatUnit.id)
  )
);
