import moment from "moment";
import "moment/locale/zh-cn";
import { humanizeTime, HumanizeTimeFormat } from "./humanizeTime";
import { NS_LIBS_DATETIME, K } from "./i18n/constants";
import i18n from "i18next";

Date.now = jest.fn(() => +new Date("2017-03-07 16:48:00"));
const TIME_OFFSET = 0;

describe("humanizeTime", () => {
  it("compute humanized time from a date string", function () {
    expect(humanizeTime("2016-03-07 15:40:00")).toBe("2016年3月7日 下午3:40");
  });

  it("compute humanized time from a number in milliseconds", function () {
    expect(humanizeTime(1457336460000)).toBe("2016年3月7日 下午3:41");
  });

  it("compute humanized time from number 0", function () {
    expect(humanizeTime(0)).toBe("1970年1月1日 早上8:00");
  });

  it("return null when given +/-Infinity", function () {
    expect(humanizeTime(Infinity)).toBe(null);
    expect(humanizeTime(-Infinity)).toBe(null);
  });

  it("compute humanized time from a Date object", function () {
    expect(humanizeTime(new Date("2016-03-07T15:42:00+08:00"))).toBe(
      "2016年3月7日 下午3:42"
    );
  });

  it("compute humanized time from a Moment object", function () {
    expect(
      humanizeTime(moment("2016-03-07 15:43:00", "YYYY-MM-DD HH:mm:ss"))
    ).toBe("2016年3月7日 下午3:43");
  });
  it("formats as the specific format", function () {
    const m1 = moment("2016-03-07 15:48:00", "YYYY-MM-DD HH:mm:ss");
    expect(humanizeTime(m1, HumanizeTimeFormat.full)).toBe(
      m1.format("LL HH:mm")
    );
    expect(humanizeTime(m1, HumanizeTimeFormat.default)).toBe(
      m1.format("LL HH:mm:ss")
    );
    expect(humanizeTime(m1, HumanizeTimeFormat.relative)).toBe(
      moment
        .duration(Math.min(+m1 - +moment().add(TIME_OFFSET), 0))
        .humanize(true)
    );
    // the same day
    const m2 = moment().add(TIME_OFFSET);
    expect(humanizeTime(m2, HumanizeTimeFormat.accurate)).toBe(
      i18n.t(`${NS_LIBS_DATETIME}:${K.TODAY}`) + m2.format("HH:mm")
    );
    // the other days when using accurate-format except these listed before
    const m3 = moment().add(TIME_OFFSET).add(370, "d");
    expect(humanizeTime(m3, HumanizeTimeFormat.accurate)).toBe(
      m3.format("LL HH:mm")
    );
  });

  it("won't show year and will show '昨天' if the time is yesterday", function () {
    // last day of the mock time
    const m = moment("2017-03-06 16:48:00", "YYYY-MM-DD HH:mm:ss");
    expect(humanizeTime(m, HumanizeTimeFormat.accurate)).toBe(
      i18n.t(`${NS_LIBS_DATETIME}:${K.YESTERDAY}`) + m.format("HH:mm")
    );
  });

  it("won't show year if the time is two days before", function () {
    const m = moment("2017-03-03 16:48:00", "YYYY-MM-DD HH:mm:ss");
    expect(humanizeTime(m, HumanizeTimeFormat.accurate)).toBe(
      m.format(i18n.t(`${NS_LIBS_DATETIME}:${K.FORMAT_SHORT_DAY}`))
    );
  });

  it("should show year if the time is within last year", function () {
    // last year of the mock time
    const m = moment().add(TIME_OFFSET).add(-1, "y");
    expect(humanizeTime(m, HumanizeTimeFormat.accurate)).toBe(
      m.format("LL HH:mm")
    );
  });

  it("formats as the specific format of last year", function () {
    const m = moment("2015-03-07 15:48:00", "YYYY-MM-DD HH:mm:ss");
    expect(humanizeTime(m)).toBe(m.format("LL ah:mm"));
  });

  it("return null when given a nil", function () {
    expect(humanizeTime(undefined)).toBe(null);
    expect(humanizeTime(null)).toBe(null);
  });
});
