import { treeToStoryboard } from "./treeToStoryboard";
import { fakeStoryboard, fakeTree } from "./fakesForTest";

describe("treeToStoryboard", () => {
  it("should work", () => {
    expect(treeToStoryboard(fakeTree())).toEqual(fakeStoryboard());
  });
});
