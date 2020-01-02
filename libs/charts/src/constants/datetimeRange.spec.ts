import { DatetimeRange, timeFilterConditions } from "./datetimeRange";

describe("convert time filter conditions", () => {
  it("convert time filter conditions correctly", () => {
    expect(timeFilterConditions[DatetimeRange.Latest15Minutes]()).toEqual(
      "time >= now() - 15m"
    );
    expect(timeFilterConditions[DatetimeRange.Latest1Hour]()).toEqual(
      "time >= now() - 1h"
    );
    expect(timeFilterConditions[DatetimeRange.Latest24Hours]()).toEqual(
      "time >= now() - 1d"
    );
    expect(timeFilterConditions[DatetimeRange.Latest7days]()).toEqual(
      "time >= now() - 7d"
    );
    expect(timeFilterConditions[DatetimeRange.Latest30days]()).toEqual(
      "time >= now() - 30d"
    );

    const testDatetime = new Date("2019-01-01 12:00:00");
    Date.now = jest.fn(() => testDatetime.getTime());
    expect(timeFilterConditions[DatetimeRange.Today]()).toEqual(
      "time >= 1546272000s AND time <= now()"
    );
  });
});
