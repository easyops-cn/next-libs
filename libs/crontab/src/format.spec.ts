import formatCrontabObject from "./format";
import i18n from "i18next";
import { NS_CRONTAB, K } from "./i18n/constants";

jest.mock("i18next");

// 注意：期望值按本仓库 yarn.lock 锁定的 cronstrue@1.88.0 措辞校准；
// 页面运行时的实际措辞随消费方（next-basics 等）解析 ^1.88.0 的结果而定，
// 新版 cronstrue 会把 "01:00 AM" 风格渲染为 "上午 01:00" 等，断言不受影响。

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
    expect(result).toEqual("在 06:02 AM");
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
      "在 01:00 AM, 02:00 AM, 03:00 AM, 04:00 AM 和 05:00 AM, 星期一 到 星期五"
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
      "在每小时的 1 到 5 分钟, 在 01:00 AM 和 05:59 AM 之间"
    );
  });

  it("should expand step-less ranges in a hour list and keep step expressions untouched", () => {
    i18n.language = "zh-CN";
    const result = formatCrontabObject({ minute: "0", hour: "6-7,9", date: "*", month: "*", dow: "*" });
    expect(result).toEqual("在 06:00 AM, 07:00 AM 和 09:00 AM");

    const stepResult = formatCrontabObject({ minute: "0", hour: "6-18/2", date: "*", month: "*", dow: "*" });
    expect(stepResult).toEqual(
      "在每小时的 0 分, 每 2 小时, 在 06:00 AM 和 06:59 PM 之间"
    );
  });

  it("should expand 0-23 to * (every hour)", () => {
    i18n.language = "zh-CN";
    const result = formatCrontabObject({ minute: "0", hour: "0-23", date: "*", month: "*", dow: "*" });
    expect(result).toEqual("每小时");
  });
});
