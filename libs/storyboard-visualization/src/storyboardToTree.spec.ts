import { storyboardToTree } from "./storyboardToTree";
import { fakeStoryboard, fakeTree } from "./fakesForTest";

describe("storyboardToTree", () => {
  it("should work", () => {
    expect(storyboardToTree(fakeStoryboard())).toEqual(fakeTree());
  });
});
