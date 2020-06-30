import { getColor } from "./getColor";

describe("getColor processor", () => {
  it("should match color", () => {
    const result = getColor("red");
    expect(result).toEqual({
      color: "var(--theme-red-color)",
      background: "var(--theme-red-background)",
      borderColor: "var(--theme-red-border-color)",
    });
  });

  it("should return origin color if don't match", () => {
    const result = getColor("#f5f5f5");
    expect(result).toEqual({
      color: "#f5f5f5",
      background: "#f5f5f5",
      borderColor: "#f5f5f5",
    });
  });
});
