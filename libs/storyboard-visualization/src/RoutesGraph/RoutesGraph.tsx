import React from "react";
import ReactDOM from "react-dom";
import {
  hierarchy,
  tree,
  HierarchyPointNode,
  HierarchyPointLink
} from "d3-hierarchy";
import { create, Selection, event as d3Event, select } from "d3-selection";
import { linkHorizontal } from "d3-shape";
import { uniqueId } from "lodash";
import classNames from "classnames";
import { RouteNodeComponent } from "./RouteNodeComponent";
// import { GraphNode, ViewItem, ContentItemActions } from "./interfaces";
// import { viewsToGraph, computeSourceX } from "../BuilderGraph/processors";
// import { GraphNodeComponent } from "./GraphNodeComponent";
import { styleConfig } from "../BuilderGraph/constants";
import { drag, dragDisable, dragEnable } from "d3-drag";
import { viewsToGraph } from "./processors";
import { GraphNode } from "./interfaces";

import styles from "./RoutesGraph.module.css";

// interface RenderOptions {
//   contentItemActions?: ContentItemActions;
//   onReorderClick?: (node: ViewItem) => void;
//   onNodeClick?: (node: ViewItem) => void;
// }

export class RoutesGraph {
  private readonly canvas: Selection<
    HTMLDivElement,
    undefined,
    null,
    undefined
  >;
  private readonly linksLayer: Selection<
    SVGSVGElement,
    undefined,
    null,
    undefined
  >;
  private readonly nodesLayer: Selection<
    HTMLDivElement,
    undefined,
    null,
    undefined
  >;
  private readonly defs: Selection<SVGDefsElement, undefined, null, undefined>;
  private readonly arrowMarkerId: string;
  private readonly linksContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly nodesContainer: Selection<
    HTMLDivElement,
    undefined,
    null,
    undefined
  >;
  private links: Selection<
    SVGGElement,
    HierarchyPointLink<GraphNode>,
    // HierarchyPointLink<any>,
    SVGGElement,
    undefined
  >;
  private nodes: Selection<
    HTMLDivElement,
    HierarchyPointNode<GraphNode>,
    // HierarchyPointNode<any>,
    HTMLDivElement,
    undefined
  >;
  // private window: Selection<
  //   Window & typeof globalThis,
  //   undefined,
  //   null,
  //   undefined
  // >;

  onDragSvg(d) {
    const { dx, dy } = d3Event;
    d.x = this.offsetLeft + dx;
    d.y = this.offsetTop + dy;
    select(this)
      .style("left", d => `${d.x}px`)
      .style("top", (d, i) => {
        return `${d.y}px`;
      });
  }

  constructor() {
    this.canvas = create("div").attr("class", styles.canvas);
    this.linksLayer = this.canvas
      .append("svg")
      .attr("class", styles.linksLayer);
    this.nodesLayer = this.canvas
      .append("div")
      .attr("class", styles.nodesLayer);
    this.defs = this.linksLayer.append("defs");
    this.arrowMarkerId = uniqueId("arrow-");
    this.defs
      .append("marker")
      .attr("id", this.arrowMarkerId)
      .attr("class", styles.arrowMarker)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");
    this.linksContainer = this.linksLayer.append("g");
    this.links = this.linksContainer.selectAll("g");
    this.nodesContainer = this.nodesLayer
      .append("div")
      .attr("class", styles.nodesContainer);
    this.nodes = this.nodesContainer.selectAll(`.${styles.nodeWrapper}`);

    // // Grabbing to scroll.
    const d3Window = select(window);
    this.linksLayer.on("mousedown", () => {
      this.linksLayer.classed(styles.grabbing, true);
      d3Event.preventDefault();
      const container = this.canvas.node().parentElement;
      const x0 = d3Event.screenX + container.scrollLeft;
      const y0 = d3Event.screenY + container.scrollTop;
      d3Window
        .on("mousemove", () => {
          container.scrollLeft = x0 - d3Event.screenX;
          container.scrollTop = y0 - d3Event.screenY;
        })
        .on("mouseup", () => {
          this.linksLayer.classed(styles.grabbing, false);
          d3Window.on("mousemove", null).on("mouseup", null);
        });
    });
  }

  getDOMNode(): HTMLDivElement {
    return this.canvas.node();
  }

  // render(builderData: ViewItem[], options?: RenderOptions): void {
  render(builderData: any[], options?: any): void {
    const nodeWidth = styleConfig.node.width;
    // x and y is swapped in horizontal tree layout.
    const dx = 40;
    // const dy = nodeWidth + 60;
    // const dy = nodeWidth;
    const dy = 40;
    const markerOffset = 5;

    const width = 800;
    const height = 800;

    this.canvas.style("min-width", `${width}px`);
    this.canvas.style("height", `${height}px`);
    this.linksLayer.attr("width", "100%");
    this.linksLayer.attr("height", height);

    const offsetX = dy / 2;
    const offsetY = dx;
    this.linksContainer.attr("transform", `translate(${offsetX},${offsetY})`);
    this.nodesContainer
      .style("left", `${offsetX}px`)
      .style("top", `${offsetY}px`);

    if (!builderData) {
      return;
    }

    this.nodes = this.nodes
      .data(viewsToGraph(builderData))
      .enter()
      .append("div")
      .attr("class", classNames(styles.nodeWrapper))
      .style("left", d => `${d.y}px`)
      .style("top", (d, i) => {
        return `${200 * i}px`;
      })
      .call(drag().on("drag", this.onDragSvg));

    this.nodes.each(function(d) {
      ReactDOM.render(
        <RouteNodeComponent originalData={d.originalData} />,
        this
      );
    });
  }
}
