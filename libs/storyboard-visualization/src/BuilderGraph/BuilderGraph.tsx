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
import { GraphNode } from "./interfaces";
import { ViewItem, ContentItemActions } from "../shared/interfaces";
import { viewsToGraph, computeSourceX } from "./processors";
import { GraphNodeComponent } from "./GraphNodeComponent";
import { styleConfig } from "./constants";

import styles from "./BuilderGraph.module.css";

interface RenderOptions {
  contentItemActions?: ContentItemActions;
  wrapAnApp?: boolean | "auto";
  onReorderClick?: (node: ViewItem) => void;
  onNodeClick?: (node: ViewItem) => void;
}

export class BuilderGraph {
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
    SVGGElement,
    undefined
  >;
  private nodes: Selection<
    HTMLDivElement,
    HierarchyPointNode<GraphNode>,
    HTMLDivElement,
    undefined
  >;
  private window: Selection<
    Window & typeof globalThis,
    undefined,
    null,
    undefined
  >;

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

    // Grabbing to scroll.
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

  render(builderData: ViewItem[], options?: RenderOptions): void {
    const nodeWidth = styleConfig.node.width;
    // x and y is swapped in horizontal tree layout.
    const dx = 40;
    const dy = nodeWidth + 60;
    const markerOffset = 5;

    const hierarchyRoot = hierarchy(
      viewsToGraph(builderData, options?.wrapAnApp)
    );

    const root = tree<GraphNode>()
      .nodeSize([dx, dy])
      .separation((a, b) => {
        // Separation should be relative to `dx`.
        // Make extra one unit as spacing.
        return (a.data.height + b.data.height) / 2 / dx + 1;
      })(hierarchyRoot);

    const width = dy * (root.height + 1);

    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      const xTop = d.x - d.data.height / 2;
      const xBottom = xTop + d.data.height;
      if (xBottom > x1) x1 = xBottom;
      if (xTop < x0) x0 = xTop;
    });
    const height = x1 - x0 + dx * 2;

    this.canvas.style("min-width", `${width}px`);
    this.canvas.style("height", `${height}px`);
    this.linksLayer.attr("width", "100%");
    this.linksLayer.attr("height", height);

    const offsetX = dy / 2;
    const offsetY = dx - x0;
    this.linksContainer.attr("transform", `translate(${offsetX},${offsetY})`);
    this.nodesContainer
      .style("left", `${offsetX}px`)
      .style("top", `${offsetY}px`);

    const linkFactory = linkHorizontal<unknown, HierarchyPointNode<GraphNode>>()
      .x(d => d.y)
      .y(d => d.x);

    this.links = this.links
      .data(
        root.links().map(({ source, target }) => {
          const offset = nodeWidth / 2;
          return {
            source: {
              ...source,
              x: computeSourceX({ source, target }),
              y: source.y + offset - 8
            },
            target: {
              ...target,
              y: target.y - offset - 5 - markerOffset
            }
          };
        })
      )
      .join(enter => {
        const link = enter.append("g");
        link.append("path").attr("marker-end", `url(#${this.arrowMarkerId})`);
        return link;
      })
      .attr("class", classNames(styles.link));

    // The extra marker offset makes it smoothy for steep links.
    this.links
      .select("path")
      .attr("d", d => `${linkFactory(d)}h${markerOffset}`);

    this.nodes = this.nodes
      .data(root.descendants())
      .join("div")
      .attr("class", classNames(styles.nodeWrapper))
      .style("left", d => `${d.y}px`)
      .style("top", d => `${d.x}px`);

    this.nodes.each(function(d) {
      ReactDOM.render(<GraphNodeComponent node={d.data} {...options} />, this);
    });
  }
}
