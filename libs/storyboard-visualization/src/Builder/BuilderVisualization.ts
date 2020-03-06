import {
  hierarchy,
  tree,
  HierarchyPointNode,
  HierarchyPointLink
} from "d3-hierarchy";
import { create, Selection, ValueFn } from "d3-selection";
import {
  linkHorizontal,
  symbol,
  symbolCircle,
  symbolDiamond,
  symbolSquare,
  SymbolType,
  symbolTriangle
} from "d3-shape";
import { findLast, uniqueId } from "lodash";
import classNames from "classnames";

import styles from "../shared/Visualization.module.css";
import { BuilderNode, BuilderItem } from "./interfaces";
import { builderToTree, getClassNameOfNodeType } from "./processors";

interface RenderOptions {
  handleNodeClick?: ValueFn<
    SVGPathElement,
    HierarchyPointNode<BuilderNode>,
    void
  >;
  handleGroupClick?: ValueFn<
    SVGPathElement,
    HierarchyPointNode<BuilderNode>,
    void
  >;
}

function getName(data: BuilderItem): string {
  if (data.alias) {
    return data.alias;
  }

  if (["brick", "provider", "template"].includes(data.type)) {
    return getBrickName(data);
  }

  return data.path;
}

function getBrickName(data: BuilderItem, showFullBrickName?: boolean): string {
  const brickName = data.template || data.brick;
  if (showFullBrickName) {
    return brickName;
  }
  return brickName.split(".").slice(-1)[0];
}

export class BuilderVisualization {
  private readonly svg: Selection<SVGSVGElement, undefined, null, undefined>;
  private readonly defs: Selection<SVGDefsElement, undefined, null, undefined>;
  private readonly arrowMarkerId: string;
  private readonly legendsContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly mainContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly linksContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly groupsContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly nodesContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private links: Selection<
    SVGGElement,
    HierarchyPointLink<BuilderNode>,
    SVGGElement,
    undefined
  >;
  private groups: Selection<
    SVGPathElement,
    HierarchyPointNode<BuilderNode>,
    SVGGElement,
    undefined
  >;
  private nodes: Selection<
    SVGGElement,
    HierarchyPointNode<BuilderNode>,
    SVGGElement,
    undefined
  >;

  constructor() {
    this.svg = create("svg").attr("class", styles.svgRoot);
    this.defs = this.svg.append("defs");
    this.arrowMarkerId = uniqueId("arrow-");
    this.defs
      .append("marker")
      .attr("id", this.arrowMarkerId)
      .attr("class", styles.arrowMarker)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");
    this.legendsContainer = this.svg
      .append("g")
      .attr("class", styles.legendsContainer);
    this.mainContainer = this.svg.append("g");
    this.linksContainer = this.mainContainer.append("g");
    this.links = this.linksContainer.selectAll("g");
    this.groupsContainer = this.mainContainer
      .append("g")
      .attr("class", styles.groupContainer);
    this.groups = this.groupsContainer.selectAll("path");
    this.nodesContainer = this.mainContainer
      .append("g")
      .attr("class", styles.nodesContainer);
    this.nodes = this.nodesContainer.selectAll("g");
  }

  getDOMNode(): SVGSVGElement {
    return this.svg.node();
  }

  render(builderData: BuilderItem[], options: RenderOptions = {}): void {
    const hierarchyRoot = hierarchy(builderToTree(builderData));
    const width = 1600;
    // x and y is swapped in horizontal tree layout.
    const dx = 40;
    const dy = width / (hierarchyRoot.height + 1);
    const root = tree<BuilderNode>()
      .nodeSize([dx, dy])
      .separation((a, b) => {
        // Make the different grouped bricks be separated.
        return a.parent === b.parent && a.data.groupIndex === b.data.groupIndex
          ? 1
          : 2;
      })(hierarchyRoot);

    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const legendsHeight = 50;

    this.svg.attr(
      "viewBox",
      [0, 0, width, x1 - x0 + dx * 2 + legendsHeight].join(",")
    );

    this.mainContainer.attr(
      "transform",
      `translate(${dy / 3},${dx - x0 + legendsHeight})`
    );

    const linkFactory = linkHorizontal<
      unknown,
      HierarchyPointNode<BuilderNode>
    >()
      .x(d => d.y)
      .y(d => d.x);

    this.links = this.links
      .data(
        root
          .links()
          .filter(
            ({ target }) =>
              target ===
              target.parent.children.find(
                item => item.data.groupIndex === target.data.groupIndex
              )
          )
          .map(({ source, target }) => {
            const offset = 20;
            const lastSibling = findLast(
              target.parent.children,
              item => item.data.groupIndex === target.data.groupIndex
            );
            let targetX = target.x;
            let targetY = target.y;
            if (lastSibling !== target) {
              targetX = (targetX + lastSibling.x) / 2;
              targetY -= dy / 3 + 5;
            } else {
              targetY -= offset;
            }
            return {
              source: {
                ...source,
                y: source.y + offset
              },
              target: {
                ...target,
                x: targetX,
                y: targetY
              }
            };
          })
      )
      .join(enter => {
        const link = enter.append("g");
        link.append("path").attr("marker-end", `url(#${this.arrowMarkerId})`);

        link.append("text").attr("dy", "0.31em");
        return link;
      })
      .attr("class", d =>
        classNames(styles.link, {
          [styles.routed]: ["routes", "bricks", "app"].includes(
            d.source.data.nodeData.type
          )
        })
      );

    this.links.select("path").attr("d", linkFactory);

    this.links
      .select("text")
      .attr("x", d => d.target.y - 5)
      .attr("y", d => {
        const offset = 8;
        if (d.target.x > d.source.x) {
          return d.target.x + offset;
        }
        return d.target.x - offset;
      })
      .text(({ source, target }) => {
        const brickTypes = ["brick", "provider", "template"];
        if (
          brickTypes.includes(source.data.nodeData.type) &&
          brickTypes.includes(target.data.nodeData.type)
        ) {
          return target.data.nodeData.mountPoint;
        }
      });

    this.groups = this.groups
      .data(
        root.descendants().filter(d => {
          if (!d.parent) {
            return false;
          }
          const siblings = d.parent.children.filter(
            item => item.data.groupIndex === d.data.groupIndex
          );
          if (siblings.length > 1 && siblings[0] === d) {
            return true;
          }
          return false;
        })
      )
      .join(enter => {
        const groupPath = enter.append("path");

        if (options.handleGroupClick) {
          groupPath.classed(styles.clickable, true);
          groupPath.on("click", options.handleGroupClick);
        } else {
          groupPath.classed(styles.clickable, false);
          groupPath.on("click", null);
        }

        return groupPath;
      })
      .attr("d", d => {
        const lastSibling = findLast(
          d.parent.children,
          item => item.data.groupIndex === d.data.groupIndex
        );
        const x0 = d.x;
        const x1 = lastSibling.x;
        return `M${d.y - dy / 3} ${x0 - dx / 2}h${(dy * 2) / 3}V${x1 +
          dx}h${(-dy * 2) / 3}z`;
      });

    const getSymbolType = (data: BuilderNode): SymbolType => {
      switch (data.nodeData.type) {
        case "app":
          return symbolCircle;
        case "redirect":
          return symbolTriangle;
        case "routes":
        case "bricks":
          return symbolDiamond;
        default:
          return symbolSquare;
      }
    };

    const symbolGenerator = symbol().size(200);

    this.nodes = this.nodes
      .data(root.descendants())
      .join(enter => {
        const node = enter.append("g");
        const nodePath = node.append("path");

        if (options.handleNodeClick) {
          nodePath.classed(styles.clickable, true);
          nodePath.on("click", options.handleNodeClick);
        } else {
          nodePath.classed(styles.clickable, false);
          nodePath.on("click", null);
        }

        node
          .append("text")
          .attr("dy", "0.31em")
          .attr("y", "1.6em");
        return node;
      })
      .attr("class", d =>
        classNames(
          styles.node,
          {
            [styles.leaf]: !d.data.children || d.data.children.length === 0,
            [styles.template]: d.data.nodeData.type === "template",
            [styles.provider]: d.data.nodeData.type === "provider"
          },
          styles[getClassNameOfNodeType(d.data.nodeData.type)]
        )
      )
      .attr("transform", d => `translate(${d.y},${d.x})`);

    this.nodes
      .select("path")
      .attr("d", d => symbolGenerator.type(getSymbolType(d.data))());

    this.nodes.select("text").text(d => getName(d.data.nodeData));

    const legends = [
      {
        nodeData: {
          type: "brick",
          alias: "构件"
        },
        hasChildren: false,
        isTemplate: false,
        isProvider: false
      },
      {
        nodeData: {
          type: "brick",
          alias: "容器构件"
        },
        hasChildren: true
      },
      {
        nodeData: {
          type: "brick",
          alias: "模板"
        },
        hasChildren: false,
        isTemplate: true,
        isProvider: false
      },
      {
        nodeData: {
          type: "brick",
          alias: "Provider"
        },
        hasChildren: false,
        isTemplate: false,
        isProvider: true
      },
      {
        nodeData: {
          type: "routes",
          alias: "路由"
        }
      },
      {
        nodeData: {
          type: "redirect",
          alias: "重定向"
        }
      }
    ];

    const legendWidth = width / (legends.length + 1);
    this.legendsContainer
      .selectAll("g")
      .data(legends, (_datum, index) => String(index))
      .join(enter => {
        const node = enter.append("g");
        node
          .append("path")
          .attr("d", d => symbolGenerator.type(getSymbolType(d as any))());
        node
          .append("text")
          .attr("dy", "0.31em")
          .attr("x", 25)
          .text(d => d.nodeData.alias);
        return node;
      })
      .attr("class", d =>
        classNames(
          styles.node,
          styles.legend,
          {
            [styles.leaf]: !d.hasChildren,
            [styles.template]: d.isTemplate,
            [styles.provider]: d.isProvider
          },
          [d.nodeData.type].filter(Boolean).map(type => styles[type])
        )
      )
      .attr(
        "transform",
        (d, index) =>
          `translate(${(index + 0.75) * legendWidth} ${legendsHeight / 2})`
      );
  }
}
