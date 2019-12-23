import regex from "./regex";

describe("crontab/regex", () => {
  it("should match valid minute syntax", () => {
    const minuteExample = [
      "23",
      "2",
      "05",
      "*",
      "*/3",
      "5,25",
      "6,*/4",
      "2-5,*/7,2-45/7",
      "*/10"
    ];
    minuteExample.forEach(example => {
      expect(example).toMatch(regex.minute);
    });
  });
  it("should not match invalid minute syntax", () => {
    const minuteExample = ["60", "*/", "7/61", "23-76", "*/0"];
    minuteExample.forEach(example => {
      expect(example).not.toMatch(regex.minute);
    });
  });
  it("should match valid hour syntax", () => {
    const hourExample = [
      "23",
      "2",
      "05",
      "0",
      "*",
      "*/3",
      "3,21",
      "4-8/2,*/14"
    ];
    hourExample.forEach(example => {
      expect(example).toMatch(regex.hour);
    });
  });
  it("should not match invalid hour syntax", () => {
    const hourExample = ["24", "*/", "4-25", "5/25", "8-13/25", "*／00"];
    hourExample.forEach(example => {
      expect(example).not.toMatch(regex.hour);
    });
  });
  it("should match valid day-of-month syntax", () => {
    const domExample = ["23", "2", "05", "*", "*/3", "4-23/6,*/7,12"];
    domExample.forEach(example => {
      expect(example).toMatch(regex.date);
    });
  });
  it("should not match invalid day-of-month syntax", () => {
    const domExample = ["32", "0", "6/"];
    domExample.forEach(example => {
      expect(example).not.toMatch(regex.date);
    });
  });
  it("should match valid month syntax", () => {
    const monthExample = [
      "12",
      "1",
      "5",
      "*",
      "*/3",
      "OCT",
      "Dec",
      "jan",
      "jan-5,*/11,4-12"
    ];
    monthExample.forEach(example => {
      expect(example).toMatch(regex.month);
    });
  });
  it("should not match invalid month syntax", () => {
    const monthExample = ["0", "13", "4/", "*4"];
    monthExample.forEach(example => {
      expect(example).not.toMatch(regex.month);
    });
  });
  it("should match valid day-of-week syntax", () => {
    const dowExample = ["0", "5", "*", "*/3", "WED", "Thu", "mon"];
    dowExample.forEach(example => {
      expect(example).toMatch(regex.dow);
    });
  });
  it("should not match invalid day-of-week syntax", () => {
    const dowExample = ["7", "13", "*/", "23-45/", "6-23"];
    dowExample.forEach(example => {
      expect(example).not.toMatch(regex.dow);
    });
  });
});
