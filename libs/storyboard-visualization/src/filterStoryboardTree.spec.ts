import { filterStoryboardTree } from "./filterStoryboardTree";
import { fakeTree } from "./fakesForTest";

describe("filterStoryboardTree", () => {
  it("should work", () => {
    const tree = fakeTree();

    const filteredTree1 = filterStoryboardTree(tree, {
      path: "/a"
    });
    expect(filteredTree1.appData).toBe(tree.appData);
    expect(filteredTree1.children.length).toBe(1);
    expect(filteredTree1.children[0]).toBe(tree.children[0]);

    const filteredTree2 = filterStoryboardTree(tree, {
      path: "/a/x/y"
    });
    expect(filteredTree2.appData).toBe(tree.appData);
    expect(filteredTree2.children.length).toBe(1);
    expect(filteredTree2.children[0]).toMatchObject(tree.children[1]);

    const filteredTree3 = filterStoryboardTree(tree, {
      path: "/a/r/o"
    });
    expect(filteredTree3.appData).toBe(tree.appData);
    expect(filteredTree3.children.length).toBe(1);
    expect(filteredTree3.children[0]).toMatchObject(tree.children[2]);
  });
});
