import moment, { DurationInputArg2 } from "moment";

export const parseDatetimeRange = (range: string) => {
  if (range === "now/d") {
    return {
      from: +moment().startOf("day"),
      to: +moment()
    };
  }

  if (range === "now/y") {
    return {
      from: +moment().startOf("year"),
      to: +moment()
    };
  }

  const reg = /^now-(\d+)(\w+)/;

  const matches = reg.exec(range);

  if (matches !== null) {
    const [, value, unit] = matches;
    return {
      from: +moment().subtract(value, unit as DurationInputArg2),
      to: +moment()
    };
  }

  return {
    from: "",
    to: ""
  };
};
