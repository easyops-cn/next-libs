import { Visualization } from "./Visualization";
import { fakeTree } from "./fakesForTest";

describe("Visualization", () => {
  it("should work", () => {
    const visual = new Visualization();
    const svg = visual.getDOMNode();
    visual.render(fakeTree());
    const containerG = Array.from(svg.children).filter(
      item => item.nodeName === "g"
    )[1];
    // links
    expect(containerG.childNodes.item(0).childNodes.length).toBe(8);
    // groups
    expect(containerG.childNodes.item(1).childNodes.length).toBe(0);
    // nodes
    expect(containerG.childNodes.item(2).childNodes.length).toBe(9);
  });
});
