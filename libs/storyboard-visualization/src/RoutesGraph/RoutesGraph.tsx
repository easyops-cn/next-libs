import React from "react";
import ReactDOM from "react-dom";
import { create, Selection, select } from "d3-selection";
import { zoomIdentity } from "d3-zoom";
import { drag } from "d3-drag";
import {
  uniqueId,
  isNil,
  filter,
  findIndex,
  maxBy,
  minBy,
  sortBy,
  map,
} from "lodash";
import { PlusOutlined } from "@ant-design/icons";
import { ContentItemActions, ZoomPanel } from "@next-libs/basic-components";
import { XYCoord } from "react-dnd";
import { RouteNodeComponent } from "./RouteNodeComponent";
import {
  RouteGraphNode,
  Edge,
  LinkVertex,
  ControlPoint,
  SnappedLinkVertex,
  SegueLinkData,
  SegueLinkError,
} from "./interfaces";
import styles from "./RoutesGraph.module.css";
import nodeComponentStyles from "./RouteNodeComponent.module.css";
import { ViewItem } from "../shared/interfaces";
import {
  nodeWidth,
  ZOOM_STEP,
  ZOOM_SCALE_MIN,
  ZOOM_SCALE_MAX,
} from "./constants";
import { getLinkVertex } from "./processors/getLinkVertex";
import { getEdgePath } from "./processors/getEdgePath";
import { getTargetVertex } from "./processors/getTargetVertex";
import { getEdgesByNodes } from "./processors/getEdgesByNodes";
import { updateDrawingLink } from "./processors/updateDrawingLink";
import { handleSegueLink } from "./processors/handleSegueLink";
import { TargetControlPointManager } from "./processors/TargetControlPointManager";

interface RenderOptions {
  contentItemActions?: ContentItemActions;
  onNodeClick?: (node: ViewItem) => void;
  handleCancelLayout?: (node: ViewItem) => void;
  onNodeDrag?: (node: ViewItem) => void;
  onSegueLink?: (segue: SegueLinkData) => void;
  onSegueLinkError?: (error: SegueLinkError) => void;
  readOnly?: boolean;
  showReferenceLines?: boolean;
  alignSize?: number;
}

const roundSize = (value: number, size: number): number => {
  if (!size) {
    return value;
  }
  return Math.round(value / size) * size;
};

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
  private readonly drawingLinkLayer: Selection<
    SVGSVGElement,
    undefined,
    null,
    undefined
  >;
  private readonly drawingLinkContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly drawingLink: Selection<
    SVGPathElement,
    undefined,
    null,
    undefined
  >;
  private readonly defs: Selection<SVGDefsElement, undefined, null, undefined>;
  private readonly arrowMarkerId: string;
  private readonly drawingArrowMarkerId: string;
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
  private finalPositionAnchorContainer: Selection<
    HTMLDivElement,
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
  private width: number;
  private height: number;
  private offsetX = 0;
  private offsetY = 0;

  private onNodeClick: (node: ViewItem) => void;
  private onNodeDrag: (node: ViewItem) => void;
  private onSegueLink: (segue: SegueLinkData) => void;
  private onSegueLinkError: (error: SegueLinkError) => void;
  private readOnly: boolean;
  private contentItemActions: ContentItemActions;
  private showReferenceLines: boolean;
  private alignSize = 10;

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
  private onDragSvg = (event: Event, d: RouteGraphNode): void => {
    if (!this.readOnly) {
      // Todo(steve): fixing types (https://github.com/DefinitelyTyped/DefinitelyTyped/issues/38939#issuecomment-683879719)
      const { dx, dy } = event as any;
      const targetX = d.node.offsetLeft + dx / this.scale;
      const targetY = d.node.offsetTop + dy / this.scale;
      let result: {
        x: number;
        y: number;
        lines: { x1: number; y1: number; x2: number; y2: number }[];
      };
      if (this.showReferenceLines) {
        result = this.getReferenceLinesAndResultPosition(targetX, targetY, d);
        d.x = result.x;
        d.y = result.y;
      } else {
        d.x = targetX;
        d.y = targetY;
      }

      const finalX = roundSize(d.x, this.alignSize);
      const finalY = roundSize(d.y, this.alignSize);
      this.finalPositionAnchorContainer
        .style("left", `${finalX - 5}px`)
        .style("top", `${finalY - 10}px`)
        .style("display", "block");
      select<HTMLDivElement, RouteGraphNode>(d.node)
        .style("left", (d) => `${d.x}px`)
        .style("top", (d, i) => {
          return `${d.y}px`;
        });
      if (this.showReferenceLines) {
        this.updateReferenceLines(result.lines);
      }
      this.renderLink();
    }
  };

  /* istanbul ignore next */
  private onDragSvgEnd = (event: Event, d: RouteGraphNode): void => {
    if (!this.readOnly) {
      this.canvas.node().style.borderColor = "#d7d7d9";
      const targetX = roundSize(d.x, this.alignSize);
      const targetY = roundSize(d.y, this.alignSize);
      d.x = targetX;
      d.y = targetY;
      select<HTMLDivElement, RouteGraphNode>(d.node)
        .style("left", (d) => `${d.x}px`)
        .style("top", (d, i) => {
          return `${d.y}px`;
        });
      this.renderLink();
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
      if (this.showReferenceLines) {
        this.updateReferenceLines([]);
      }
      this.finalPositionAnchorContainer.style("display", "none");
    }
  };

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
      .attr("class", styles.referenceLine);
    this.referenceLines?.selectAll("path").attr("d", (d: any) => {
      return `M${d.x1},${d.y1}L${d.x2},${d.y2}`;
    });
  }

  constructor() {
    this.zoomPanel = create("div").attr("class", styles.zoomPanel);
    this.canvas = create("div").attr("class", styles.canvas);
    this.linksLayer = this.canvas
      .append("svg")
      .attr("class", styles.linksLayer);
    this.nodesLayer = this.canvas
      .append("div")
      .attr("class", styles.nodesLayer);
    this.drawingLinkLayer = this.canvas
      .append("svg")
      .attr("class", styles.drawingLinkLayer);
    this.defs = this.linksLayer.append("defs");
    this.arrowMarkerId = uniqueId("arrow-");
    this.drawingArrowMarkerId = uniqueId("arrow-");
    for (const [id, className] of [
      [this.arrowMarkerId, styles.arrowMarker],
      [this.drawingArrowMarkerId, styles.drawingArrowMarker],
    ]) {
      this.defs
        .append("marker")
        .attr("id", id)
        .attr("class", className)
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z");
    }
    this.linksContainer = this.linksLayer.append("g");
    this.links = this.linksContainer.selectAll("g");
    this.referenceLinesContainer = this.linksLayer.append("g");
    this.referenceLines = this.referenceLinesContainer.selectAll("g");
    this.drawingLinkContainer = this.drawingLinkLayer.append("g");
    this.drawingLink = this.drawingLinkContainer
      .append("path")
      .attr("class", styles.drawingLink)
      .attr("marker-end", `url(#${this.arrowMarkerId})`);
    this.nodesContainer = this.nodesLayer
      .append("div")
      .attr("class", styles.nodesContainer);
    this.finalPositionAnchorContainer = this.nodesLayer
      .append("div")
      .attr("class", styles.positionAnchorIcon)
      .style("display", "none");
    this.finalPositionAnchorContainer.append("div");
    this.nodes = this.nodesContainer.selectAll(`.${styles.nodeWrapper}`);

    // Grabbing to scroll.
    const d3Window = select(window);
    d3Window.on("resize", () => {
      this.getCanvasSize();
    });
    this.canvas.call(
      drag<HTMLDivElement, any>()
        .on("start", () => {
          this.linksLayer.classed(styles.grabbing, true);
        })
        .on("drag", (event) => {
          const { dx, dy } = event as any;
          this.transform(-dx, -dy, this.scale);
        })
        .on("end", () => {
          this.linksLayer.classed(styles.grabbing, false);
        })
    );
    this.canvas
      .on("wheel", function (event: Event) {
        event.preventDefault();
      })
      // Todo(steve): fixing types (https://github.com/DefinitelyTyped/DefinitelyTyped/issues/38939#issuecomment-683879719)
      .on("wheel.zoom", (event: any) => {
        event.stopPropagation();
        const { deltaX, deltaY, ctrlKey } = event;
        // macOS trackPad pinch event is emitted as a wheel.zoom and event.ctrlKey set to true
        if (ctrlKey) {
          this.scale += ZOOM_STEP * (event.wheelDelta > 0 ? 1 : -1);
          this.scale = Math.min(ZOOM_SCALE_MAX, this.scale);
          this.scale = Math.max(ZOOM_SCALE_MIN, this.scale);
          this.transform(0, 0, this.scale);
          return;
        }
        this.transform(deltaX, deltaY, this.scale);
      });
  }

  getDOMNode(): HTMLDivElement {
    this.renderLink();
    return this.canvas.node();
  }

  getZoomPanelNode(): HTMLDivElement {
    return this.zoomPanel.node();
  }

  /* istanbul ignore next */
  onDragEnd(value: XYCoord, item: RouteGraphNode): void {
    if (value) {
      const container = this.canvas.node();
      const rect = container.getBoundingClientRect();
      const targetX = (value.x - rect.left + this.offsetX) / this.scale;
      const targetY = (value.y - rect.top + this.offsetY) / this.scale;
      if (value.x > rect.left && value.y > rect.top) {
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

  transform(dx: number, dy: number, scale: number): void {
    this.offsetX += dx;
    this.offsetY += dy;
    const transformToNodes = `translate(${-this.offsetX}px, ${-this
      .offsetY}px) scale(${scale})`;
    const transform = zoomIdentity
      .translate(-this.offsetX, -this.offsetY)
      .scale(scale);
    this.scale = scale;
    this.linksContainer.attr("transform", transform.toString());
    this.referenceLinesContainer.attr("transform", transform.toString());
    this.drawingLinkContainer.attr("transform", transform.toString());
    this.nodesLayer.style("transform", transformToNodes);
    this.renderZoomPanel();
    this.getCanvasSize();
  }

  autoCenter(): void {
    const elemContainerRect = this.canvas.node().getBoundingClientRect();
    const { minX, maxX, minY, maxY } = this.getNodesPositionInfo();
    this.autoScale(minX, maxX, minY, maxY);
    const nodeCenterX = (minX * this.scale + maxX * this.scale) / 2;
    const dx =
      minX === 0 && maxX === 0
        ? -this.offsetX
        : nodeCenterX - elemContainerRect.width / 2 - this.offsetX;
    const dy = minY * this.scale - this.offsetY;
    // x轴去到中心位置，y轴去到最顶部
    this.transform(dx, dy, this.scale);
  }

  getNodesPositionInfo(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    const graphNodesData = this.nodes.data();
    const margin = 38;
    let [minX, maxX, minY, maxY] = [0, 0, 0, 0];
    if (graphNodesData?.length > 0) {
      const minXItem = minBy(graphNodesData, (item) => {
        return item.x;
      });
      minX = minXItem.x;
      const maxXItem = maxBy(graphNodesData, (item) => {
        return item.x + nodeWidth;
      });
      maxX = maxXItem.x + nodeWidth;
      const minYItem = minBy(graphNodesData, (item) => {
        return item.y;
      });
      minY = minYItem.y;
      const maxYItem = maxBy(graphNodesData, (item) => {
        return item.y + item.nodeConfig.height + margin;
      });
      maxY = maxYItem.y + maxYItem.nodeConfig.height + margin;
    }
    return {
      minX,
      maxX,
      minY,
      maxY,
    };
  }

  autoScale(minX: number, maxX: number, minY: number, maxY: number): void {
    const elemContainerRect = this.canvas.node().getBoundingClientRect();
    let scale = 1;
    const oriWidth = maxX - minX;
    const oriHeight = maxY - minY;
    let scaleWidth = (maxX - minX) * scale;
    let scaleHeight = (maxY - minY) * scale;
    const width = elemContainerRect.width;
    const height = elemContainerRect.height;
    while (scale > ZOOM_SCALE_MIN) {
      if (scaleWidth < width && scaleHeight < height) {
        break;
      }
      scale -= ZOOM_STEP;
      scaleWidth = oriWidth * scale;
      scaleHeight = oriHeight * scale;
    }
    this.scale = scale;
  }

  renderZoomPanel(): void {
    const handleZoom = (scale: number): void => {
      this.transform(0, 0, scale);
    };
    const autoCenter = (): void => {
      this.autoCenter();
    };
    this.zoomPanel.datum({ scale: this.scale }).each(function (d) {
      ReactDOM.render(
        <ZoomPanel
          scale={d.scale}
          step={ZOOM_STEP}
          range={[ZOOM_SCALE_MIN, ZOOM_SCALE_MAX]}
          notifyScaleChange={handleZoom}
          autoCenter={autoCenter}
        />,
        this
      );
    });
  }

  updateElement(graphData: RouteGraphNode[]): void {
    const updateNode = this.nodes.data(graphData, (d) => d.originalData.id);
    const enterNode = updateNode.enter();
    const exitNode = updateNode.exit();
    exitNode.remove();
    let countNotPositionedNode = 0;
    const defaultWidth = 180;
    const enterWrapper = enterNode
      .append("div")
      .attr("class", `${styles.nodeWrapper} ${nodeComponentStyles.nodeWrapper}`)
      .style("left", (d) => {
        d.x = d.x ?? d.originalData?.graphInfo?.x;
        // Automatically locate unlocated nodes
        if (isNil(d.x)) {
          d.x = countNotPositionedNode * defaultWidth;
          countNotPositionedNode++;
        }
        return `${d.x}px`;
      })
      .style("top", (d) => {
        d.y = d.y ?? d.originalData?.graphInfo?.y ?? 0;
        return `${d.y}px`;
      })
      .call(
        drag<HTMLDivElement, RouteGraphNode>()
          .on("drag", this.onDragSvg)
          .on("end", this.onDragSvgEnd)
      );
    enterWrapper.append("div").attr("class", styles.nodeInnerWrapper);

    const controls = ["top", "right", "bottom", "left"] as const;
    const drawingLinkContainer = this.drawingLinkContainer.node();
    const { canvas, drawingLink, arrowMarkerId, drawingArrowMarkerId } = this;
    let sourceVertex: SnappedLinkVertex, targetVertex: LinkVertex;
    const updateTargetControlPoint = TargetControlPointManager(styles);
    const getSegueLinkHandlers = () => ({
      onSegueLink: this.onSegueLink,
      onSegueLinkError: this.onSegueLinkError,
    });
    for (const control of controls) {
      enterWrapper
        .append("div")
        .attr("class", `${styles.controlPoint} ${styles[control]}`)
        .call(
          drag<HTMLDivElement, RouteGraphNode>()
            .on(
              "start",
              /* istanbul ignore next */ function (e: any, d) {
                e.sourceEvent.stopPropagation();
                canvas.node().classList.add(styles.drawing);
                this.parentElement.classList.add(
                  styles.active,
                  nodeComponentStyles.active
                );
                const sourceControl = (
                  ["left", "top", "bottom", "right"] as ControlPoint[]
                ).find((item) => this.classList.contains(styles[item]));
                sourceVertex = getLinkVertex({
                  control: sourceControl,
                  node: d,
                });
                drawingLink.attr("d", `M${sourceVertex.x} ${sourceVertex.y}`);
                drawingLink.classed(styles.available, true);
                drawingLink.attr("marker-end", `url(#${arrowMarkerId})`);
              }
            )
            .on(
              "drag",
              /* istanbul ignore next */ function (event: any) {
                targetVertex = getTargetVertex({
                  event,
                  sourceVertex,
                  nodeWrapperClassName: styles.nodeWrapper,
                  drawingLinkContainer,
                  updateTargetControlPoint,
                });
                updateDrawingLink({
                  sourceVertex,
                  targetVertex,
                  linkSnappedClassName: styles.linkSnapped,
                  drawingLink,
                  arrowMarkerId,
                  drawingArrowMarkerId,
                });
              }
            )
            .on(
              "end",
              /* istanbul ignore next */ function (e: any) {
                canvas.node().classList.remove(styles.drawing);
                this.parentElement.classList.remove(
                  styles.active,
                  nodeComponentStyles.active
                );
                drawingLink.classed(styles.available, false);
                drawingLink.attr("marker-end", `url(#${arrowMarkerId})`);
                updateTargetControlPoint(null);
                handleSegueLink({
                  sourceVertex,
                  targetVertex,
                  ...getSegueLinkHandlers(),
                });
                sourceVertex = null;
                targetVertex = null;
              }
            )
        );
    }
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
        this.firstElementChild
      );
    });
    this.finalPositionAnchorContainer.each(function (d) {
      ReactDOM.render(<PlusOutlined />, this);
    });
    const edges = getEdgesByNodes(graphData);

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
      .attr("class", styles.link);

    this.renderZoomPanel();
    this.renderLink();
  }

  getCanvasSize(): void {
    this.width = this.canvas.node().offsetWidth;
    this.height = this.canvas.node().offsetHeight;
    this.linksLayer.attr("width", this.width);
    this.linksLayer.attr("height", this.height);
    this.drawingLinkLayer.attr("width", this.width);
    this.drawingLinkLayer.attr("height", this.height);
  }

  render(builderData: any[], options?: RenderOptions): void {
    this.readOnly = options?.readOnly;
    this.showReferenceLines = options?.showReferenceLines;
    this.alignSize = options?.alignSize;
    this.onNodeClick = options?.onNodeClick;
    this.onNodeDrag = options?.onNodeDrag;
    this.onSegueLink = options?.onSegueLink;
    this.contentItemActions = options?.contentItemActions;
    this.routesData = builderData;
    if (!builderData) {
      return;
    }
    this.updateElement(builderData);
    this.autoCenter();
    this.getCanvasSize();
  }

  renderLink(): void {
    this.links?.selectAll<SVGPathElement, Edge>("path").attr("d", getEdgePath);
  }
}
