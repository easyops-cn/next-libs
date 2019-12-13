import { StoryboardTree, StoryboardNode } from "./interfaces";
import { hierarchy, tree, HierarchyPointNode } from "d3-hierarchy";
import { create } from "d3-selection";
import {
  linkHorizontal,
  symbol,
  symbolCircle,
  symbolDiamond,
  symbolSquare,
  symbolTriangle,
  SymbolType
} from "d3-shape";

export function render(storyboard: StoryboardTree): SVGSVGElement {
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

  const legendsHeight = 50;

  const svg = create("svg").attr(
    "viewBox",
    [0, 0, width, x1 - x0 + dx * 2 + legendsHeight].join(",")
  );

  const defs = svg.append("defs");
  const marker = defs
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", "#555")
    .attr("fill-opacity", 0.8);

  const legendsGroup = svg
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12);

  const g = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("transform", `translate(${dy / 3},${dx - x0 + legendsHeight})`);

  const linkFactory = linkHorizontal<
    unknown,
    HierarchyPointNode<StoryboardNode>
  >()
    .x(d => d.y)
    .y(d => d.x);

  const link = g
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("stroke-dasharray", d =>
      d.target.data.type === "route" ? "3 2" : "none"
    )
    .attr("marker-end", "url(#arrow)")
    .attr("d", ({ source, target }) => {
      // 根据 depth 决定线往左边缩还是右边缩
      const depthSign = source.depth <= target.depth ? 1 : -1;
      const offset = 20;
      return linkFactory({
        source: {
          ...source,
          y: source.y + depthSign * offset
        },
        target: {
          ...target,
          y: target.y - depthSign * offset
        }
      });
    });

  const node = g
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  const getSymbolType = (data: StoryboardNode): SymbolType => {
    switch (data.type) {
      case "app":
        return symbolCircle;
      case "brick":
        return symbolSquare;
      case "route":
        return symbolTriangle;
      case "slot":
        return symbolDiamond;
    }
  };

  const symbolGenerator = symbol().size(200);

  node
    .append("path")
    .attr("fill", d =>
      d.data.type === "slot" && d.data.slotType === "routes"
        ? "#555"
        : d.data.type === "brick"
        ? "#999"
        : "none"
    )
    .attr("stroke-width", 2)
    .attr("stroke", d =>
      d.data.type === "brick" && !d.data.children ? "#999" : "#555"
    )
    .attr("d", d => symbolGenerator.type(getSymbolType(d.data))())
    .attr("transform", d =>
      d.data.type === "slot"
        ? "rotate(90)"
        : d.data.type === "route"
        ? "scale(0.66)"
        : null
    );

  node
    .append("text")
    .attr("dy", "0.31em")
    .attr("y", d =>
      d.data.type === "route" || d.data.type === "slot" ? "-1.4em" : "1.4em"
    )
    .attr("text-anchor", "middle")
    .text(d => {
      switch (d.data.type) {
        case "app":
          return d.data.appData.name;
        case "route":
          return (Array.isArray(d.data.routeData.path)
            ? d.data.routeData.path[0]
            : d.data.routeData.path
          ).replace("${APP.homepage}", "/~");
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

  const legends = [
    {
      type: "brick",
      hasChildren: false,
      name: "构件"
    },
    {
      type: "brick",
      hasChildren: true,
      name: "容器构件"
    },
    {
      type: "slot",
      slotType: "routes",
      name: "插槽：路由"
    },
    {
      type: "slot",
      slotType: "bricks",
      name: "插槽：构件"
    },
    {
      type: "route",
      name: "路由"
    }
  ];

  const legendWidth = width / (legends.length + 1);
  const legendNode = legendsGroup
    .selectAll("g")
    .data(legends)
    .join("g")
    .attr(
      "transform",
      (d, index) =>
        `translate(${(index + 0.75) * legendWidth} ${legendsHeight / 2})`
    );

  legendNode
    .append("path")
    .attr("fill", d =>
      d.type === "slot" && d.slotType === "routes"
        ? "#555"
        : d.type === "brick"
        ? "#999"
        : "none"
    )
    .attr("stroke-width", 2)
    .attr("stroke", d =>
      d.type === "brick" && !d.hasChildren ? "#999" : "#555"
    )
    .attr("d", d => symbolGenerator.type(getSymbolType(d as any))())
    .attr("transform", d =>
      d.type === "slot"
        ? "rotate(90)"
        : d.type === "route"
        ? "scale(0.66)"
        : null
    );

  legendNode
    .append("text")
    .attr("dy", "0.31em")
    .attr("x", 25)
    .text(d => d.name);

  return svg.node();
}
