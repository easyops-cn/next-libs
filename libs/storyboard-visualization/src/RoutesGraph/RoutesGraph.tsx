import React from "react";
import ReactDOM from "react-dom";
import {
  hierarchy,
  tree,
  HierarchyPointNode,
  HierarchyPointLink
} from "d3-hierarchy";
import { create, Selection, event as d3Event, select } from "d3-selection";
import { linkHorizontal, linkVertical } from "d3-shape";
import { uniqueId, values, compact, find } from "lodash";
import classNames from "classnames";
import { RouteNodeComponent } from "./RouteNodeComponent";
import { styleConfig } from "../BuilderGraph/constants";
import { drag, dragDisable, dragEnable } from "d3-drag";
import { viewsToGraph } from "./processors";
import { GraphNode } from "./interfaces";

import styles from "./RoutesGraph.module.css";
import { ViewItem } from "../shared/interfaces";

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

  onDragSvg(d, k, nodeList) {
    const { dx, dy } = d3Event;
    d.x = nodeList[k].offsetLeft + dx;
    d.y = nodeList[k].offsetTop + dy;
    select(nodeList[k])
      .style("left", d => `${d.x}px`)
      .style("top", (d, i) => {
        return `${d.y}px`;
      });
    this.renderLink();
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
    this.renderLink();
    return this.canvas.node();
  }

  getEdges(nodes: ViewItem[]) {
    if (nodes) {
      const edges = [];
      nodes.forEach((node, index) => {
        if (node.originalData?.segues) {
          const targets = compact(
            values(node.originalData.segues).map(targetItem => {
              // 可能需要处理下没有alias只有path的情况
              const target = find(
                nodes,
                n => n.originalData.alias === targetItem.target
              );
              if (!target) {
                return null;
              } else {
                return {
                  source: node,
                  target
                };
              }
            })
          );
          edges.push(...targets);
        }
      });
      return edges;
    }
  }

  getLinkPosition(d) {
    // 暂定 后面根据节点类型写，或者找个办法知道所有节点render完成的时机
    const nodeWidth = 160;
    const nodeHeight = 213;

    const [
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight
    ] = [
      d.source.x,
      d.source.y,
      // d.source.node.offsetWidth,
      nodeWidth,
      nodeHeight,
      // d.source.node.offsetHeight,
      d.target.x,
      d.target.y,
      nodeWidth,
      nodeHeight
      // d.target.node.offsetWidth,
      // d.target.node.offsetHeight
    ];
    // 默认
    d.source.linkX = sourceX + sourceWidth / 2;
    d.source.linkY = sourceY;
    d.target.linkX = targetX + targetWidth / 2;
    d.target.linkY = targetY;
    // S 高于 T
    if (sourceY + sourceHeight < targetY) {
      d.source.linkY = sourceY + sourceHeight;
      return `${this.linkFactory(d)}`;
      // T 高于 S
    } else if (sourceY > targetY + targetHeight) {
      d.target.linkY = targetY + targetHeight;
      return `${this.linkFactory(d)}`;
      // S.T 高度重合
    } else if (sourceY + sourceHeight > targetY) {
      // S 在 T 左侧
      if (sourceX + sourceWidth < targetX) {
        d.source.linkX = sourceX + sourceWidth;
        d.source.linkY = sourceY + sourceHeight / 2;
        d.target.linkX = targetX;
        d.target.linkY = targetY + targetHeight / 2;
        return `${this.linkHorizontalFactory(d)}`;
        // S 在 T 右侧
      } else if (sourceX > targetX + targetWidth) {
        d.source.linkX = sourceX;
        d.source.linkY = sourceY + sourceHeight / 2;
        d.target.linkX = targetX + targetWidth;
        d.target.linkY = targetY + targetHeight / 2;
        return `${this.linkHorizontalFactory(d)}`;
      }
    }
    return `${this.linkFactory(d)}`;
  }

  // 后面改成直接拿宽度
  nodeWidth = 150;

  linkFactory = linkVertical<unknown, HierarchyPointNode<GraphNode>>()
    .x(d => d.linkX)
    .y(d => d.linkY);
  linkHorizontalFactory = linkHorizontal<
    unknown,
    HierarchyPointNode<GraphNode>
  >()
    .x(d => d.linkX)
    .y(d => d.linkY);

  // render(builderData: ViewItem[], options?: RenderOptions): void {
  render(builderData: any[], options?: any): void {
    const nodeWidth = styleConfig.node.width;
    // x and y is swapped in horizontal tree layout.
    const dx = 40;
    // const dy = nodeWidth + 60;
    // const dy = nodeWidth;
    const dy = 40;
    // const markerOffset = 5;
    // const markerOffset = 30;

    const width = 2000;
    const height = 2000;

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

    const nodes = viewsToGraph(builderData);

    this.nodes = this.nodes
      .data(nodes)
      .enter()
      .append("div")
      .attr("class", classNames(styles.nodeWrapper))
      .style("left", (d, i) => {
        d.x = d.x ?? d.originalData?.x;
        return `${d.x}px`;
      })
      .style("top", (d, i) => {
        d.y = d.y ?? d.originalData?.y;
        return `${d.y}px`;
      })
      .call(drag().on("drag", this.onDragSvg.bind(this)));

    const edges = this.getEdges(nodes);

    this.links = this.links
      .data(edges)
      .join(enter => {
        const link = enter.append("g");
        link.append("path").attr("marker-end", `url(#${this.arrowMarkerId})`);
        return link;
      })
      .attr("class", classNames(styles.link));

    this.nodes.each(function(d) {
      d.node = this;
      ReactDOM.render(
        <RouteNodeComponent originalData={d.originalData} />,
        this
      );
    });

    this.renderLink();
  }

  renderLink() {
    this.links?.selectAll("path").attr("d", d => {
      return this.getLinkPosition(d);
    });
  }
}
