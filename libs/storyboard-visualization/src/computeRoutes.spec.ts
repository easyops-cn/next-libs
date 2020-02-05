import { computeRoutes } from "./computeRoutes";
import { fakeTree } from "./fakesForTest";

describe("computeRoutes", () => {
  it("should work", () => {
    expect(computeRoutes(fakeTree())).toEqual([
      "/a",
      "/a/x",
      "/a/x/y",
      "/a/r",
      "/a/r/o"
    ]);
  });
});
