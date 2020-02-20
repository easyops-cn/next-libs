import { transformColor } from "./transformColor";

describe("transformColor processor", () => {
  it("should match color", () => {
    const result = transformColor("red");
    expect(result).toEqual("var(--theme-red-color)");
  });

  it("should return origin color if don't match", () => {
    const result = transformColor("#f5f5f5");
    expect(result).toEqual("#f5f5f5");
  });
});
