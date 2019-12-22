import formatCrontabObject from "./format";

describe("crontab format", () => {
  it("should format correctly", () => {
    const crontab = {
      minute: "2",
      hour: "6",
      date: "*",
      month: "*",
      dow: "*"
    };

    const result = formatCrontabObject(crontab);

    expect(result).toEqual("在 06:02 AM");
  });
});
