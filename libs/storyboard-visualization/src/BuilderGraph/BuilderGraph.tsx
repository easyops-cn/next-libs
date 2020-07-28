import React from "react";
import ReactDOM from "react-dom";
import {
  hierarchy,
  tree,
  HierarchyPointNode,
  HierarchyPointLink,
} from "d3-hierarchy";
import { create, Selection, event as d3Event, select } from "d3-selection";
import { linkHorizontal } from "d3-shape";
import { uniqueId, isNil } from "lodash";
import classNames from "classnames";
import { GraphNode } from "./interfaces";
import { ViewItem } from "../shared/interfaces";
import { viewsToGraph, computeSourceX } from "./processors";
import { GraphNodeComponent } from "./GraphNodeComponent";
import { styleConfig } from "./constants";
import { ContentItemActions } from "@libs/basic-components";
import { zoomIdentity } from "d3-zoom";

import styles from "./BuilderGraph.module.css";

interface RenderOptions {
  contentItemActions?: ContentItemActions;
  wrapAnApp?: boolean | "auto";
  onReorderClick?: (node: ViewItem) => void;
  onNodeClick?: (node: ViewItem) => void;
  onDragEnd?: (offsetX: number, offsetY: number) => void;
  initialOffsetX?: number;
  initialOffsetY?: number;
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

  private onDragEnd: (offsetX: number, offsetY: number) => void;

  private offsetX = 0;
  private offsetY = 0;
  private nodesContainerWidth: number;
  private nodesContainerHeight: number;

  constructor() {
    this.canvas = create("div").attr("class", styles.canvas);
    this.linksLayer = this.canvas
      .append("svg")
      .attr("class", styles.linksLayer)
      .style("overflow", "visible");
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
    /* istanbul ignore next */
    this.canvas
      .on("mousedown", () => {
        this.canvas.classed(styles.grabbing, true);
        d3Event.preventDefault();
        const x0 = d3Event.screenX + this.offsetX;
        const y0 = d3Event.screenY + this.offsetY;
        d3Window
          .on("mousemove", () => {
            const dx = x0 - d3Event.screenX - this.offsetX;
            const dy = y0 - d3Event.screenY - this.offsetY;
            this.transform(dx, dy);
          })
          .on("mouseup", () => {
            this.onDragEnd?.(
              Math.floor(this.offsetX),
              Math.floor(this.offsetY)
            );
            this.canvas.classed(styles.grabbing, false);
            d3Window.on("mousemove", null).on("mouseup", null);
          });
      })
      .on("wheel", function () {
        d3Event.preventDefault();
      })
      .on("wheel.zoom", () => {
        d3Event.stopPropagation();
        const { deltaX, deltaY, ctrlKey } = d3Event;
        // macOS trackPad pinch event is emitted as a wheel.zoom and d3.event.ctrlKey set to true
        if (ctrlKey) {
          return;
        }
        this.transform(deltaX, deltaY);
      });
  }

  /* istanbul ignore next */
  transform(dx: number, dy: number): void {
    const nodeWidth = styleConfig.node.width;
    const maxOffsetX = this.nodesContainerWidth - nodeWidth / 2;
    const maxOffsetY = this.nodesContainerHeight - nodeWidth / 2;
    const minOffsetX = -this.canvas.node().offsetWidth + nodeWidth / 2;
    const minOffsetY = -this.canvas.node().offsetHeight + nodeWidth / 2;
    const resultX = this.offsetX + dx;
    const resultY = this.offsetY + dy;
    if (resultX > maxOffsetX) {
      this.offsetX = maxOffsetX;
    } else if (resultX < minOffsetX) {
      this.offsetX = minOffsetX;
    } else {
      this.offsetX = resultX;
    }

    if (resultY > maxOffsetY) {
      this.offsetY = maxOffsetY;
    } else if (resultY < minOffsetY) {
      this.offsetY = minOffsetY;
    } else {
      this.offsetY = resultY;
    }
    const transformToNodes = `translate(${-this.offsetX}px, ${-this
      .offsetY}px)`;
    const transform = zoomIdentity.translate(-this.offsetX, -this.offsetY);
    this.linksLayer.attr("transform", transform.toString());
    this.nodesLayer.style("transform", transformToNodes);
  }

  getDOMNode(): HTMLDivElement {
    return this.canvas.node();
  }

  render(builderData: ViewItem[], options?: RenderOptions): void {
    this.onDragEnd = options?.onDragEnd;
    const initialOffsetX = options?.initialOffsetX;
    const initialOffsetY = options?.initialOffsetY;
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
    this.nodesContainerWidth = width;

    let x0 = Infinity;
    let x1 = -x0;
    root.each((d) => {
      const xTop = d.x - d.data.height / 2;
      const xBottom = xTop + d.data.height;
      if (xBottom > x1) x1 = xBottom;
      if (xTop < x0) x0 = xTop;
    });
    const height = x1 - x0 + dx * 2;
    this.nodesContainerHeight = height;

    this.canvas.attr("width", "100%");
    this.canvas.style("height", `100%`);
    this.linksLayer.attr("width", "100%");
    this.linksLayer.attr("height", height);

    const offsetX = dy / 2;
    const offsetY = dx - x0;
    this.linksContainer.attr("transform", `translate(${offsetX},${offsetY})`);
    this.nodesContainer
      .style("left", `${offsetX}px`)
      .style("top", `${offsetY}px`);

    const linkFactory = linkHorizontal<unknown, HierarchyPointNode<GraphNode>>()
      .x((d) => d.y)
      .y((d) => d.x);

    this.links = this.links
      .data(
        root.links().map(({ source, target }) => {
          const offset = nodeWidth / 2;
          return {
            source: {
              ...source,
              x: computeSourceX({ source, target }),
              y: source.y + offset - 8,
            },
            target: {
              ...target,
              y: target.y - offset - 5 - markerOffset,
            },
          };
        })
      )
      .join((enter) => {
        const link = enter.append("g");
        link.append("path").attr("marker-end", `url(#${this.arrowMarkerId})`);
        return link;
      })
      .attr("class", classNames(styles.link));

    // The extra marker offset makes it smoothy for steep links.
    this.links
      .select("path")
      .attr("d", (d) => `${linkFactory(d)}h${markerOffset}`);

    this.nodes = this.nodes
      .data(root.descendants())
      .join("div")
      .attr("class", classNames(styles.nodeWrapper))
      .style("left", (d) => `${d.y}px`)
      .style("top", (d) => `${d.x}px`);

    this.nodes.each(function (d) {
      ReactDOM.render(<GraphNodeComponent node={d.data} {...options} />, this);
    });

    if (!isNil(initialOffsetX) && !isNil(initialOffsetY)) {
      this.offsetX = initialOffsetX;
      this.offsetY = initialOffsetY;
      this.transform(0, 0);
      return;
    }
    // When the nodesContainer width or height is smaller than the canvas width or height, transform the nodesContainer to the middle of the x-axis or y-axis.
    const canvasWidth = this.canvas.node().offsetWidth;
    const canvasHeight = this.canvas.node().offsetHeight;
    const dx0 =
      this.nodesContainerWidth < canvasWidth
        ? this.nodesContainerWidth / 2 - canvasWidth / 2 - this.offsetX
        : -this.offsetX;
    const dy0 =
      this.nodesContainerHeight < canvasHeight
        ? this.nodesContainerHeight / 2 - canvasHeight / 2 - this.offsetY
        : -this.offsetY;
    this.transform(dx0, dy0);
  }
}
