import { RoutesGraph } from "./RoutesGraph";
import { fakeRoutesGraphNodes } from "../fakesForTest";

describe("RoutesGraph", () => {
  it("should work", () => {
    const visual = new RoutesGraph();
    visual.render(fakeRoutesGraphNodes());
    const canvas = visual.getDOMNode();
    const routesPreviewNode = visual.getRoutesPreviewNode();
    const zoomPanelNode = visual.getZoomPanelNode();
    const linksLayer = canvas.querySelector(".linksLayer");
    expect(linksLayer.querySelectorAll(".link").length).toBe(1);
    expect(routesPreviewNode.querySelectorAll(".previewTag").length).toBe(1);
    const nodesLayer = canvas.querySelector(".nodesLayer");
    expect(nodesLayer.querySelectorAll(".nodeWrapper").length).toBe(2);
  });
});
