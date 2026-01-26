// SPL Mode Integration Test
import { getSplMode } from "./SplMode";

describe("SplMode", () => {
  it("should create SPL mode instance", () => {
    const SplModeClass = getSplMode();
    expect(SplModeClass).toBeDefined();
    const splMode = new SplModeClass();
    expect(splMode).toBeDefined();
  });

  it("should have HighlightRules defined", () => {
    const SplModeClass = getSplMode();
    const splMode = new SplModeClass();
    expect(splMode.HighlightRules).toBeDefined();
  });

  it("should have proper behaviour and outdent", () => {
    const SplModeClass = getSplMode();
    const splMode = new SplModeClass();
    expect(splMode.$outdent).toBeDefined();
    expect(splMode.$behaviour).toBeDefined();
  });
});
