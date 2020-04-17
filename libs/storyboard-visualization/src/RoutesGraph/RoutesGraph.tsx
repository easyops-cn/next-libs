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
  maxBy,
  minBy,
  sortBy,
  map,
} from "lodash";
import classNames from "classnames";
import { RouteNodeComponent } from "./RouteNodeComponent";
import { drag } from "d3-drag";
import { RouteGraphNode, Edge } from "./interfaces";
import { RoutesPreview } from "./RoutesPreview";
import { XYCoord } from "react-dnd";
import styles from "./RoutesGraph.module.css";
import { getLinkPath } from "./processors";
import { ViewItem, ContentItemActions } from "../shared/interfaces";
import {
  nodeWidth,
  ZOOM_STEP,
  ZOOM_SCALE_MIN,
  ZOOM_SCALE_MAX,
} from "./constants";
import { ZoomPanel } from "./ZoomPanel";
import { zoomIdentity } from "d3-zoom";
import { getHistory } from "@easyops/brick-kit";

interface RenderOptions {
  contentItemActions?: ContentItemActions;
  onNodeClick?: (node: ViewItem) => void;
  onNodeDrag?: (node: ViewItem) => void;
  readOnly?: boolean;
}

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
  private readonly referenceLinesContainer: Selection<
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
  private readonly zoomPanel: Selection<
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
  private referenceLines: Selection<
    SVGGElement,
    { x1: number; y1: number; x2: number; y2: number },
    SVGGElement,
    undefined
  >;
  private scale = 1;

  private onNodeClick: (node: ViewItem) => void;
  private onNodeDrag: (node: ViewItem) => void;
  private readOnly: boolean;
  private contentItemActions: ContentItemActions;

  private routesData: any[];

  /* istanbul ignore next */
  getReferenceLinesAndResultPosition(
    resultX: number,
    resultY: number,
    d: RouteGraphNode
  ): {
    x: number;
    y: number;
    lines: { x1: number; y1: number; x2: number; y2: number }[];
  } {
    let x = resultX;
    let y = resultY;
    // 参考线阀值
    const threshold = 6;
    const nodesData = this.nodes.data();
    if (nodesData.length < 2) {
      return {
        x,
        y,
        lines: [],
      };
    }
    // leftPoint
    const leftPointXNode = minBy(nodesData, (item) => {
      if (item.originalData.id !== d.originalData.id) {
        return Math.abs(resultX - item.x);
      }
    });
    const relativeX = Math.abs(resultX - leftPointXNode.x);
    const lines = [];
    if (relativeX < threshold) {
      x = leftPointXNode.x;
      const sortNodes = sortBy([d, leftPointXNode], (item) => item.y);
      lines.push(
        ...[
          {
            x1: x,
            y1: sortNodes[0].y,
            x2: x,
            y2: sortNodes[1].node.offsetHeight + sortNodes[1].y,
          },
          {
            x1: x + nodeWidth / 2,
            y1: sortNodes[0].y + sortNodes[0].node.offsetHeight,
            x2: x + nodeWidth / 2,
            y2: sortNodes[1].y,
          },
          {
            x1: x + nodeWidth,
            y1: sortNodes[0].y,
            x2: x + nodeWidth,
            y2: sortNodes[1].node.offsetHeight + sortNodes[1].y,
          },
        ]
      );
    }
    const options = [];
    // topY
    const topYNode = minBy(nodesData, (item) => {
      if (item.originalData.id !== d.originalData.id) {
        return Math.abs(resultY - item.y);
      }
    });
    const relativeY = Math.abs(resultY - topYNode.y);
    if (relativeY < threshold) {
      const sortNodes = sortBy([d, topYNode], (item) => item.x);
      options.push({
        relativeY,
        resultY: topYNode.y,
        line: {
          x1: sortNodes[0].x,
          y1: topYNode.y,
          x2: sortNodes[1].node.offsetWidth + sortNodes[1].x,
          y2: topYNode.y,
        },
      });
    }
    // bottomY
    const bottomYNode = minBy(nodesData, (item) => {
      if (item.originalData.id !== d.originalData.id) {
        return Math.abs(
          resultY + d.node.offsetHeight - (item.y + item.node.offsetHeight)
        );
      }
    });
    const relativeYOfBottom = Math.abs(
      resultY +
        d.node.offsetHeight -
        (bottomYNode.y + bottomYNode.node.offsetHeight)
    );
    if (relativeYOfBottom < threshold) {
      const sortNodes = sortBy([d, bottomYNode], (item) => item.x);
      options.push({
        relativeY: relativeYOfBottom,
        resultY:
          bottomYNode.y + bottomYNode.node.offsetHeight - d.node.offsetHeight,
        line: {
          x1: sortNodes[0].x,
          y1: bottomYNode.y + bottomYNode.node.offsetHeight,
          x2: sortNodes[1].x + sortNodes[1].node.offsetWidth,
          y2: bottomYNode.y + bottomYNode.node.offsetHeight,
        },
      });
    }
    // midY
    const midYNode = minBy(nodesData, (item) => {
      if (item.originalData.id !== d.originalData.id) {
        return Math.abs(
          resultY +
            d.node.offsetHeight / 2 -
            (item.y + item.node.offsetHeight / 2)
        );
      }
    });
    const relativeYOfMid = Math.abs(
      resultY +
        d.node.offsetHeight / 2 -
        (midYNode.y + midYNode.node.offsetHeight / 2)
    );
    if (relativeYOfMid < threshold) {
      const sortNodes = sortBy([d, midYNode], (item) => item.x);
      options.push({
        relativeY: relativeYOfMid,
        resultY:
          midYNode.y + midYNode.node.offsetHeight / 2 - d.node.offsetHeight / 2,
        line: {
          x1: sortNodes[0].x + sortNodes[0].node.offsetWidth,
          y1: midYNode.y + midYNode.node.offsetHeight / 2,
          x2: sortNodes[1].x,
          y2: midYNode.y + midYNode.node.offsetHeight / 2,
        },
      });
    }
    if (options.length) {
      const filteredOptions = filter(options, (option) => option.relativeY < 3);
      if (filteredOptions.length > 0) {
        lines.push(...map(filteredOptions, "line"));
        y = filteredOptions[0].resultY;
      } else {
        const minOption = minBy(options, (option) => option.relativeY);
        lines.push(minOption.line);
        y = minOption.resultY;
      }
    }
    return {
      x,
      y,
      lines,
    };
  }

  /* istanbul ignore next */
  onDragSvg(d: RouteGraphNode): void {
    if (!this.readOnly) {
      const { dx, dy } = d3Event;
      const targetX = d.node.offsetLeft + dx;
      const targetY = d.node.offsetTop + dy;
      const result = this.getReferenceLinesAndResultPosition(
        targetX,
        targetY,
        d
      );
      d.x = result.x;
      d.y = result.y;
      if (d.x < 0 || d.y < 0) {
        this.canvas.node().style.borderColor = "red";
      } else {
        this.canvas.node().style.borderColor = "#d7d7d9";
      }
      select<HTMLDivElement, RouteGraphNode>(d.node)
        .style("left", (d) => `${d.x}px`)
        .style("top", (d, i) => {
          return `${d.y}px`;
        });
      this.updateReferenceLines(result.lines);
      this.renderLink();
      this.getCanvasSize();
    }
  }

  /* istanbul ignore next */
  onDragSvgEnd(d: RouteGraphNode): void {
    if (!this.readOnly) {
      this.canvas.node().style.borderColor = "#d7d7d9";
      if (d.x < 0 || d.y < 0) {
        const index = findIndex(this.routesData, [
          "originalData.id",
          d.originalData.id,
        ]);
        const newData = this.routesData;
        delete newData[index].originalData.graphInfo.x;
        delete newData[index].originalData.graphInfo.y;
        delete d.x;
        delete d.y;
        this.updateElement(newData);
        this.onNodeDrag?.({
          id: d.originalData.id,
          graphInfo: newData[index].originalData.graphInfo,
          instanceId: d.originalData.instanceId,
        });
        this.updateReferenceLines([]);
        return;
      }
      if (
        d.originalData?.graphInfo?.x !== d.x ||
        d.originalData?.graphInfo?.y !== d.y
      ) {
        this.onNodeDrag?.({
          id: d.originalData.id,
          graphInfo: { ...d.originalData.graphInfo, x: d.x, y: d.y },
          instanceId: d.originalData.instanceId,
        });
      }
      this.updateReferenceLines([]);
    }
  }

  /* istanbul ignore next */
  updateReferenceLines(
    lines: { x1: number; y1: number; x2: number; y2: number }[]
  ): void {
    this.referenceLines = this.referenceLines
      .data(lines, (d) => `M${d.x1},${d.y1}L${d.x2},${d.y2}`)
      .join((enter) => {
        const link = enter.append("g");
        link.append("path");
        return link;
      })
      .attr("class", classNames(styles.referenceLine));
    this.referenceLines?.selectAll("path").attr("d", (d: any) => {
      return `M${d.x1},${d.y1}L${d.x2},${d.y2}`;
    });
  }

  constructor() {
    this.routesPreviewContainer = create("div").attr(
      "class",
      styles.routesPreviewContainer
    );
    this.zoomPanel = create("div").attr("class", styles.zoomPanel);
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
    this.referenceLinesContainer = this.linksLayer.append("g");
    this.referenceLines = this.referenceLinesContainer.selectAll("g");
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

  getZoomPanelNode(): HTMLDivElement {
    // console.log(this.zoomPanel.node(),'this.zoomPanel.node()');
    return this.zoomPanel.node();
  }

  getEdges(nodes: RouteGraphNode[]): Edge[] {
    if (nodes) {
      const edges: Edge[] = [];
      nodes.forEach((node, index) => {
        if (node.originalData?.segues) {
          const targets = compact(
            values(node.originalData.segues).map((targetItem) => {
              const target = find(
                nodes,
                (n) => n.originalData.alias === targetItem.target
              );
              if (!target) {
                return null;
              } else {
                return {
                  source: node,
                  target,
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
          item.originalData.id,
        ]);
        if (index !== -1) {
          const newData = this.routesData;
          newData[index].originalData.graphInfo = {
            ...newData[index].originalData.graphInfo,
            x: targetX,
            y: targetY,
          };
          this.updateElement(newData);
          this.onNodeDrag?.({
            id: item.originalData.id,
            graphInfo: newData[index].originalData.graphInfo,
            instanceId: item.originalData.instanceId,
          });
        }
      }
    }
  }

  transform(dx: number, dy: number, scale: number) {
    const transform = zoomIdentity.scale(scale);
    const transformLinks = zoomIdentity
      .translate(20 * scale, 20 * scale)
      .scale(scale);
    this.scale = scale;
    this.linksContainer.attr("transform", transformLinks.toString());
    this.referenceLinesContainer.attr("transform", transformLinks.toString());
    this.nodesLayer.style("transform", transform.toString());
    // const history = getHistory();
    // const urlSearchParams = new URLSearchParams(history.location.search);
    // urlSearchParams.set("scale", scale);
    // history.push(`?${urlSearchParams}`, { notify: false });
    // this.getCanvasSize();
  }

  updateElement(data: RouteGraphNode[]): void {
    const [previewData, graphData] = [
      filter(data, (item) => {
        return (
          isNil(item.originalData.graphInfo?.x) ||
          isNil(item.originalData.graphInfo?.y)
        );
      }),
      reject(data, (item) => {
        return (
          isNil(item.originalData.graphInfo?.x) ||
          isNil(item.originalData.graphInfo?.y)
        );
      }),
    ];
    const updateNode = this.nodes.data(graphData, (d) => {
      const id = d.originalData.id;
      return id;
    });
    const enterNode = updateNode.enter();
    const exitNode = updateNode.exit();
    exitNode.remove();

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
        drag<HTMLDivElement, RouteGraphNode>()
          .on("drag", this.onDragSvg.bind(this))
          .on("end", this.onDragSvgEnd.bind(this))
      );
    this.nodes = this.nodesContainer.selectAll(`.${styles.nodeWrapper}`);
    const onNodeClick = this.onNodeClick;
    const contentItemActions = this.contentItemActions;
    this.nodes.each(function (d) {
      d.node = this;
      ReactDOM.render(
        <RouteNodeComponent
          originalData={d.originalData}
          onNodeClick={onNodeClick}
          contentItemActions={contentItemActions}
        />,
        this
      );
    });
    const edges = this.getEdges(graphData);

    this.links = this.links
      .data(
        edges,
        (d) =>
          `sourceId${d.source.originalData.id}targetId${d.target.originalData.id}`
      )
      .join((enter) => {
        const link = enter.append("g");
        link.append("path").attr("marker-end", `url(#${this.arrowMarkerId})`);
        return link;
      })
      .attr("class", classNames(styles.link));

    const onDragEnd = this.onDragEnd.bind(this);
    const readOnly = this.readOnly;
    this.routesPreviewContainer.datum(previewData).each(function (d) {
      ReactDOM.render(
        <RoutesPreview
          routes={d}
          onDragEnd={onDragEnd}
          onNodeClick={onNodeClick}
          readOnly={readOnly}
          contentItemActions={contentItemActions}
        />,
        this
      );
    });
    const zoomData = {
      scale: 1.2,
    };
    const handleZoom = (scale: number) => {
      this.transform(0, 0, scale);
    };
    this.zoomPanel.datum(zoomData).each(function (d) {
      ReactDOM.render(
        <ZoomPanel
          scale={d.scale}
          step={ZOOM_STEP}
          range={[ZOOM_SCALE_MIN, ZOOM_SCALE_MAX]}
          notifyScaleChange={handleZoom}
        />,
        this
      );
    });
    this.renderLink();
  }

  getCanvasSize(): void {
    // console.log(this.scale,'this.scale');
    const graphNodesData = this.nodes.data();
    const padding = 20;
    const margin = 20;
    const maxXItem = maxBy(graphNodesData, (item) => {
      // 固定宽度
      return item.x + nodeWidth + padding;
    });
    // const maxX = maxXItem ? maxXItem.x + nodeWidth + padding + margin : "100%";
    const maxX = maxXItem
      ? (maxXItem.x + nodeWidth + padding + margin) * 2
      : "100%";
    const maxYItem = maxBy(graphNodesData, (item) => {
      return item.y + item.nodeConfig?.height + padding + 52;
    });
    // const maxY = maxYItem
    //   ? maxYItem.y + maxYItem.nodeConfig?.height + padding + margin + 52
    //   : "100%";
    const maxY = maxYItem
      ? (maxYItem.y + maxYItem.nodeConfig?.height + padding + margin + 52) * 2
      : "100%";
    // this.linksLayer.attr("width", maxX);
    // this.linksLayer.attr("height", maxY);
    // 默认给2倍宽高
    this.linksLayer.attr("width", maxX);
    this.linksLayer.attr("height", maxY);
  }

  render(builderData: any[], options?: RenderOptions): void {
    this.readOnly = options?.readOnly;
    this.onNodeClick = options?.onNodeClick;
    this.onNodeDrag = options?.onNodeDrag;
    this.contentItemActions = options?.contentItemActions;
    this.routesData = builderData;
    const offsetX = 20;
    const offsetY = 20;
    this.linksContainer.attr("transform", `translate(${offsetX},${offsetY})`);
    this.referenceLinesContainer.attr(
      "transform",
      `translate(${offsetX},${offsetY})`
    );
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
    // console.log('test')
    this.links?.selectAll("path").attr("d", (d: any) => {
      return getLinkPath(d);
    });
  }
}
