import formatCrontabObject from "./format";
import i18n from "i18next";

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
});
