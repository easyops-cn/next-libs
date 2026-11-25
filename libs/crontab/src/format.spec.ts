import formatCrontabObject from "./format";
import i18n from "i18next";
import { NS_CRONTAB, K } from "./i18n/constants";

jest.mock("i18next");

describe("crontab format", () => {
  it("should format zh-CN correctly", () => {
    i18n.language = "zh-CN";
    const crontab = {
      minute: "2",
      hour: "6",
      date: "*",
      month: "*",
      dow: "*",
    };

    const result = formatCrontabObject(crontab);
    expect(result).toEqual("在上午 06:02");
  });

  it("should format en correctly", () => {
    i18n.language = "en";
    const crontab = {
      minute: "2",
      hour: "6",
      date: "*",
      month: "*",
      dow: "*",
    };

    const result = formatCrontabObject(crontab);
    expect(result).toEqual("At 06:02 AM");
  });
  it("should custom week format", () => {
    i18n.language = "en";
    const crontab = {
      minute: "*",
      hour: "*",
      date: "3",
      month: "*",
      dow: "4,6",
    };

    const result = formatCrontabObject(crontab, true);
    expect(result).toEqual(
      "Every minute, on day 3 of the month," +
        i18n.t(`${NS_CRONTAB}:${K.OR_MONTHLY}`) +
        "Thursday and Saturday"
    );
  });

  it("should not custom week format when date is * (no OR semantics)", () => {
    i18n.language = "en";
    const crontab = {
      minute: "*",
      hour: "*",
      date: "*",
      month: "*",
      dow: "1-5",
    };

    const result = formatCrontabObject(crontab, true);
    expect(result).toEqual("Every minute, Monday through Friday");
    // en 下 i18n.t 被 mock，直接断言不包含中文的 OR_MONTHLY 前缀
    expect(result).not.toContain("或者每月的");
    expect(result).not.toContain("or monthly");
  });

  // https://github.com/bradymholt/cRonstrue 对「分钟单值 + 小时范围」的描述
  // 为 "每小时, 在 01:00 和 05:59 之间"，中文语境易误读为每分钟执行（需求和BUG-27555）
  it("should expand hour range to list so range and enum expressions share the same description", () => {
    i18n.language = "zh-CN";
    const rangeExpr = { minute: "0", hour: "1-5", date: "*", month: "*", dow: "1-5" };
    const enumExpr = { minute: "0", hour: "1,2,3,4,5", date: "*", month: "*", dow: "1-5" };

    const rangeResult = formatCrontabObject(rangeExpr, true);
    const enumResult = formatCrontabObject(enumExpr, true);

    expect(rangeResult).toEqual(enumResult);
    expect(rangeResult).toEqual(
      "在 上午 01:00, 上午 02:00, 上午 03:00, 上午 04:00 和 上午 05:00, 星期一至星期五"
    );
  });

  it("should expand hour range in en", () => {
    i18n.language = "en";
    const result = formatCrontabObject(
      { minute: "0", hour: "1-5", date: "*", month: "*", dow: "1-5" },
      true
    );
    expect(result).toEqual(
      "At 01:00 AM, 02:00 AM, 03:00 AM, 04:00 AM and 05:00 AM, Monday through Friday"
    );
  });

  it("should keep hour expression untouched when minute is not a single value", () => {
    i18n.language = "zh-CN";
    // 分钟为范围时不展开小时范围，避免生成冗长的复合描述
    const result = formatCrontabObject({ minute: "1-5", hour: "1-5", date: "*", month: "*", dow: "*" });
    expect(result).toEqual(
      "在每小时的第 1 到 5 分钟, 在 上午 01:00 和 上午 05:59 之间"
    );
  });

  it("should expand step-less ranges in a hour list and keep step expressions untouched", () => {
    i18n.language = "zh-CN";
    const result = formatCrontabObject({ minute: "0", hour: "6-7,9", date: "*", month: "*", dow: "*" });
    expect(result).toEqual("在 上午 06:00, 上午 07:00 和 上午 09:00");

    const stepResult = formatCrontabObject({ minute: "0", hour: "6-18/2", date: "*", month: "*", dow: "*" });
    expect(stepResult).toEqual(
      "在每小时的第 0 分钟, 每隔 2 小时, 在 上午 06:00 和 下午 06:59 之间"
    );
  });

  it("should expand 0-23 to * (every hour)", () => {
    i18n.language = "zh-CN";
    const result = formatCrontabObject({ minute: "0", hour: "0-23", date: "*", month: "*", dow: "*" });
    expect(result).toEqual("每小时");
  });
});
