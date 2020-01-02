import moment from "moment";

export enum DatetimeRange {
  Latest15Minutes = "now-15m",
  Latest1Hour = "now-1h",
  Latest24Hours = "now-1d",
  Today = "now/d",
  Latest7days = "now-7d",
  Latest30days = "now-30d"
}

export const datetimeRangeList = [
  {
    label: "近15分钟",
    from: DatetimeRange.Latest15Minutes
  },
  {
    label: "近1小时",
    from: DatetimeRange.Latest1Hour
  },
  {
    label: "近24小时",
    from: DatetimeRange.Latest24Hours
  },
  {
    label: "今天",
    from: DatetimeRange.Today
  },
  {
    label: "近7天",
    from: DatetimeRange.Latest7days
  },
  {
    label: "近30天",
    from: DatetimeRange.Latest30days
  }
];

export const timeFilterConditions: { [key: string]: () => string } = {
  [DatetimeRange.Latest15Minutes]: () => "time >= now() - 15m",
  [DatetimeRange.Latest1Hour]: () => "time >= now() - 1h",
  [DatetimeRange.Latest24Hours]: () => "time >= now() - 1d",
  [DatetimeRange.Today]: () =>
    `time >= ${moment()
      .startOf("day")
      .unix()}s AND time <= now()`,
  [DatetimeRange.Latest7days]: () => "time >= now() - 7d",
  [DatetimeRange.Latest30days]: () => "time >= now() - 30d"
};
