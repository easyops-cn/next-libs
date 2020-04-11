import React from "react";
import ReactDOM from "react-dom";
import { create, Selection, event as d3Event, select } from "d3-selection";
import {
  uniqueId,
  values,
  compact,
  find,
  isNil,
  filter,
  reject,
  findIndex,
  maxBy
} from "lodash";
import classNames from "classnames";
import { RouteNodeComponent } from "./RouteNodeComponent";
import { drag } from "d3-drag";
import { RouteGraphNode, Edge } from "./interfaces";
import { RoutesPreview } from "./RoutesPreview";
import { XYCoord } from "react-dnd";
import styles from "./RoutesGraph.module.css";
import { getLinkPath } from "./processors";

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
  private readonly routesPreviewContainer: Selection<
    HTMLDivElement,
    undefined,
    null,
    undefined
  >;
  private links: Selection<SVGGElement, Edge, SVGGElement, undefined>;
  private nodes: Selection<
    HTMLDivElement,
    RouteGraphNode,
    HTMLDivElement,
    undefined
  >;

  private routesData: any[];

  /* istanbul ignore next */
  onDragSvg(d: RouteGraphNode): void {
    const { dx, dy } = d3Event;
    const resultX = d.node.offsetLeft + dx;
    const resultY = d.node.offsetTop + dy;
    d.x = resultX < 0 ? 0 : resultX;
    d.y = resultY < 0 ? 0 : resultY;
    select<HTMLDivElement, RouteGraphNode>(d.node)
      .style("left", d => `${d.x}px`)
      .style("top", (d, i) => {
        return `${d.y}px`;
      });
    this.renderLink();
    this.getCanvasSize();
  }

  constructor() {
    this.routesPreviewContainer = create("div").attr(
      "class",
      styles.routesPreviewContainer
    );
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
      const container = this.canvas.node();
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

  getRoutesPreviewNode(): HTMLDivElement {
    return this.routesPreviewContainer.node();
  }

  getEdges(nodes: RouteGraphNode[]): Edge[] {
    if (nodes) {
      const edges: Edge[] = [];
      nodes.forEach((node, index) => {
        if (node.originalData?.segues) {
          const targets = compact(
            values(node.originalData.segues).map(targetItem => {
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

  /* istanbul ignore next */
  onDragEnd(value: XYCoord, item: RouteGraphNode): void {
    if (value) {
      const container = this.canvas.node();
      const rect = container.getBoundingClientRect();
      const targetX = value.x - rect.left + container.scrollLeft;
      const targetY = value.y - rect.top + container.scrollTop;
      if (targetX >= 0 && targetY >= 0) {
        const index = findIndex(this.routesData, [
          "originalData.id",
          item.originalData.id
        ]);
        if (index !== -1) {
          const newData = this.routesData;
          newData[index].originalData.graphInfo = {
            ...newData[index].originalData.graphInfo,
            x: targetX,
            y: targetY
          };
          this.updateElement(newData);
        }
      }
    }
  }

  updateElement(data: RouteGraphNode[]): void {
    const [previewData, graphData] = [
      filter(data, item => {
        return (
          isNil(item.originalData.graphInfo?.x) ||
          isNil(item.originalData.graphInfo?.y)
        );
      }),
      reject(data, item => {
        return (
          isNil(item.originalData.graphInfo?.x) ||
          isNil(item.originalData.graphInfo?.y)
        );
      })
    ];
    const updateNode = this.nodes.data(graphData, d => {
      const id = d.originalData.id;
      return id;
    });
    const enterNode = updateNode.enter();
    const exitNode = updateNode.exit();

    enterNode
      .append("div")
      .attr("class", classNames(styles.nodeWrapper))
      .style("left", (d, i) => {
        d.x = d.x ?? d.originalData?.graphInfo?.x;
        return `${d.x}px`;
      })
      .style("top", (d, i) => {
        d.y = d.y ?? d.originalData?.graphInfo?.y;
        return `${d.y}px`;
      })
      .call(
        drag<HTMLDivElement, RouteGraphNode>().on(
          "drag",
          this.onDragSvg.bind(this)
        )
      );
    this.nodes = this.nodesContainer.selectAll(`.${styles.nodeWrapper}`);
    this.nodes.each(function(d) {
      d.node = this;
      ReactDOM.render(
        <RouteNodeComponent originalData={d.originalData} />,
        this
      );
    });
    const edges = this.getEdges(graphData);

    this.links = this.links
      .data(edges)
      .join(enter => {
        const link = enter.append("g");
        link.append("path").attr("marker-end", `url(#${this.arrowMarkerId})`);
        return link;
      })
      .attr("class", classNames(styles.link));

    const onDragEnd = this.onDragEnd.bind(this);
    this.routesPreviewContainer.datum(previewData).each(function(d) {
      ReactDOM.render(<RoutesPreview routes={d} onDragEnd={onDragEnd} />, this);
    });
    this.renderLink();
  }

  getCanvasSize(): void {
    const graphNodesData = this.nodes.data();
    const padding = 20;
    const maxXItem = maxBy(graphNodesData, item => {
      // 固定宽度
      return item.x + 160 + padding;
    });
    const maxX = maxXItem ? maxXItem.x + 160 + padding : "100%";
    const maxYItem = maxBy(graphNodesData, item => {
      return item.y + item.nodeConfig?.height + padding + 52;
    });
    const maxY = maxYItem
      ? maxYItem.y + maxYItem.nodeConfig?.height + padding + 52
      : "100%";
    this.linksLayer.attr("width", maxX);
    this.linksLayer.attr("height", maxY);
  }

  render(builderData: any[], options?: any): void {
    this.routesData = builderData;
    const offsetX = 20;
    const offsetY = 20;
    this.linksContainer.attr("transform", `translate(${offsetX},${offsetY})`);
    this.nodesContainer
      .style("left", `${offsetX}px`)
      .style("top", `${offsetY}px`);

    if (!builderData) {
      return;
    }
    this.updateElement(builderData);
    this.getCanvasSize();
  }

  renderLink(): void {
    this.links?.selectAll("path").attr("d", (d: any) => {
      return getLinkPath(d);
    });
  }
}
