import { ProcessedStoryboard, StoryboardNode } from "./interfaces";
import { hierarchy, tree, HierarchyPointNode } from "d3-hierarchy";
import { create } from "d3-selection";
import { linkHorizontal } from "d3-shape";

export function render(storyboard: ProcessedStoryboard): SVGSVGElement {
  const hierarchyRoot = hierarchy(storyboard);
  const width = 1600;
  // x and y is swapped in horizontal tree layout.
  const dx = 40;
  const dy = width / (hierarchyRoot.height + 1);
  const root = tree<StoryboardNode>().nodeSize([dx, dy])(hierarchyRoot);

  let x0 = Infinity;
  let x1 = -x0;
  root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  const svg = create("svg").attr(
    "viewBox",
    [0, 0, width, x1 - x0 + dx * 2].join(",")
  );

  const g = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("transform", `translate(${dy / 3},${dx - x0})`);

  const link = g
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr(
      "d",
      linkHorizontal<unknown, HierarchyPointNode<StoryboardNode>>()
        .x(d => d.y)
        .y(d => d.x)
    );

  const node = g
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node
    .append("circle")
    .attr("fill", d => (d.children ? "#555" : "#999"))
    .attr("r", 2.5);

  node
    .append("text")
    .attr("dy", "0.31em")
    .attr("y", d =>
      d.data.type === "route" || d.data.type === "slot" ? "-1.25em" : "1.25em"
    )
    .attr("text-anchor", "middle")
    .text(d => {
      switch (d.data.type) {
        case "app":
          return "root";
        case "route":
          return (d.data.routeData.path as string).replace(
            "${APP.homepage}",
            "/~"
          );
        case "brick":
          return d.data.brickData.template || d.data.brickData.brick;
        case "slot":
          return d.data.slotName;
      }
    })
    .attr("fill", d => {
      switch (d.data.type) {
        case "app":
          return "black";
        case "route":
          return d.data.routeData.exact ? "red" : "orange";
        case "brick":
          return d.data.brickData.template ? "blue" : "green";
        case "slot":
          return "gray";
      }
    })
    .clone(true)
    .lower()
    .attr("stroke", "white");

  return svg.node();
}
