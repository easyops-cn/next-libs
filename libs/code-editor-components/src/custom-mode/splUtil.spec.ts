// SPL Utils Test
import { splCompleters } from "./splUtil";

describe("splUtil", () => {
  it("should export splCompleters array", () => {
    expect(splCompleters).toBeDefined();
    expect(Array.isArray(splCompleters)).toBe(true);
    expect(splCompleters.length).toBeGreaterThan(0);
  });

  it("should have getCompletions function", () => {
    expect(splCompleters[0]).toBeDefined();
    expect(typeof splCompleters[0].getCompletions).toBe("function");
  });

  it("should return completions with proper structure", () => {
    const mockCallback = jest.fn();
    splCompleters[0].getCompletions(null, null, null, "", mockCallback);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    const [error, completions] = mockCallback.mock.calls[0];

    expect(error).toBeNull();
    expect(Array.isArray(completions)).toBe(true);
    expect(completions.length).toBeGreaterThan(0);
  });

  it("should have completions with correct properties", () => {
    const mockCallback = jest.fn();
    splCompleters[0].getCompletions(null, null, null, "", mockCallback);

    const [, completions] = mockCallback.mock.calls[0];
    const firstItem = completions[0];

    expect(firstItem).toHaveProperty("caption");
    expect(firstItem).toHaveProperty("value");
    expect(firstItem).toHaveProperty("meta");
    expect(firstItem).toHaveProperty("score");
    expect(typeof firstItem.caption).toBe("string");
    expect(typeof firstItem.value).toBe("string");
    expect(typeof firstItem.meta).toBe("string");
    expect(typeof firstItem.score).toBe("number");
  });

  it("should include SPL commands in completions", () => {
    const mockCallback = jest.fn();
    splCompleters[0].getCompletions(null, null, null, "", mockCallback);

    const [, completions] = mockCallback.mock.calls[0];
    const commands = completions.filter((item: any) => item.meta === "command");

    expect(commands.length).toBeGreaterThan(0);
    expect(commands.some((item: any) => item.caption === "search")).toBe(true);
    expect(commands.some((item: any) => item.caption === "stats")).toBe(true);
    expect(commands.some((item: any) => item.caption === "eval")).toBe(true);
  });

  it("should include SPL stats functions in completions", () => {
    const mockCallback = jest.fn();
    splCompleters[0].getCompletions(null, null, null, "", mockCallback);

    const [, completions] = mockCallback.mock.calls[0];
    const statsFunctions = completions.filter(
      (item: any) => item.meta === "stats function"
    );

    expect(statsFunctions.length).toBeGreaterThan(0);
    expect(statsFunctions.some((item: any) => item.caption === "count")).toBe(
      true
    );
    expect(statsFunctions.some((item: any) => item.caption === "sum")).toBe(
      true
    );
    expect(statsFunctions.some((item: any) => item.caption === "avg")).toBe(
      true
    );
  });

  it("should include SPL eval functions in completions", () => {
    const mockCallback = jest.fn();
    splCompleters[0].getCompletions(null, null, null, "", mockCallback);

    const [, completions] = mockCallback.mock.calls[0];
    const evalFunctions = completions.filter(
      (item: any) => item.meta === "eval function"
    );

    expect(evalFunctions.length).toBeGreaterThan(0);
    expect(evalFunctions.some((item: any) => item.caption === "if")).toBe(true);
    expect(evalFunctions.some((item: any) => item.caption === "substr")).toBe(
      true
    );
    expect(evalFunctions.some((item: any) => item.caption === "len")).toBe(
      true
    );
  });

  it("should include SPL built-in fields in completions", () => {
    const mockCallback = jest.fn();
    splCompleters[0].getCompletions(null, null, null, "", mockCallback);

    const [, completions] = mockCallback.mock.calls[0];
    const builtInFields = completions.filter(
      (item: any) => item.meta === "built-in field"
    );

    expect(builtInFields.length).toBeGreaterThan(0);
    expect(builtInFields.some((item: any) => item.caption === "_time")).toBe(
      true
    );
    expect(builtInFields.some((item: any) => item.caption === "_raw")).toBe(
      true
    );
    expect(builtInFields.some((item: any) => item.caption === "host")).toBe(
      true
    );
  });
});
