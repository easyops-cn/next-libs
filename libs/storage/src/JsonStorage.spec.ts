import { JsonStorage } from "./";

describe("JsonStorage", () => {
  it("should work", () => {
    let storage = new JsonStorage(localStorage);
    const key = "somekey";
    expect(storage.getItem(key)).toBe(null);
    storage.setItem(key, { for: "good" });
    expect(storage.getItem(key)).toMatchObject({ for: "good" });
    storage.removeItem(key);
    expect(storage.getItem(key)).toBe(null);
    storage.setItem(key, { for: "better" });
    expect(storage.getItem(key)).toMatchObject({ for: "better" });
    storage.clear();
    expect(storage.getItem(key)).toBe(null);
  });
});
