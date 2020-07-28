import { BuilderGraph } from "./BuilderGraph";
import { fakeBuilderGraphSource } from "../fakesForTest";

describe("BuilderGraph", () => {
  it("should work", () => {
    const visual = new BuilderGraph();
    visual.render(fakeBuilderGraphSource());

    const canvas = visual.getDOMNode();
    const linksLayer = canvas.querySelector(".linksLayer");
    expect(linksLayer.querySelectorAll(".link").length).toBe(1);

    const nodesLayer = canvas.querySelector(".nodesLayer");
    expect(nodesLayer.querySelectorAll(".nodeWrapper").length).toBe(2);
    visual.render(fakeBuilderGraphSource(), {
      onDragEnd: jest.fn(),
      initialOffsetX: 100,
      initialOffsetY: 100,
    });
  });
});
