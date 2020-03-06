import { BuilderVisualization } from "./BuilderVisualization";
import { fakeBuilder } from "../fakesForTest";

describe("BuilderVisualization", () => {
  it("should work", () => {
    const visual = new BuilderVisualization();
    const svg = visual.getDOMNode();
    visual.render(fakeBuilder());
    const containerG = Array.from(svg.children).filter(
      item => item.nodeName === "g"
    )[1];
    // links
    expect(containerG.childNodes.item(0).childNodes.length).toBe(2);
    // groups
    expect(containerG.childNodes.item(1).childNodes.length).toBe(1);
    // nodes
    expect(containerG.childNodes.item(2).childNodes.length).toBe(4);
  });
});
