import {
  hierarchy,
  tree,
  HierarchyPointNode,
  HierarchyPointLink
} from "d3-hierarchy";
import { create, Selection, select, ValueFn } from "d3-selection";
import {
  linkHorizontal,
  symbol,
  symbolCircle,
  symbolDiamond,
  symbolSquare,
  SymbolType
} from "d3-shape";
import { findLast, uniqueId } from "lodash";
import classNames from "classnames";
import { computeRealRoutePath } from "@easyops/brick-utils";
import { BrickConf } from "@easyops/brick-types";
import { StoryboardTree, StoryboardNode } from "./interfaces";

import styles from "./Visualization.module.css";

interface RenderOptions {
  showFullBrickName?: boolean;
  handleNodeClick?: ValueFn<
    SVGPathElement,
    HierarchyPointNode<StoryboardNode>,
    void
  >;
}

const getBrickName = (
  brickData: BrickConf,
  showFullBrickName?: boolean
): string => {
  const brickName = brickData.template || brickData.brick;
  if (showFullBrickName) {
    return brickName;
  }
  return brickName.split(".").slice(-1)[0];
};

export class Visualization {
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
    HierarchyPointLink<StoryboardNode>,
    SVGGElement,
    undefined
  >;
  private groups: Selection<
    SVGPathElement,
    HierarchyPointNode<StoryboardNode>,
    SVGGElement,
    undefined
  >;
  private nodes: Selection<
    SVGGElement,
    HierarchyPointNode<StoryboardNode>,
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

  render(storyboardTree: StoryboardTree, options: RenderOptions = {}): void {
    const hierarchyRoot = hierarchy(storyboardTree);
    const width = 1600;
    // x and y is swapped in horizontal tree layout.
    const dx = 40;
    const dy = width / (hierarchyRoot.height + 1);
    const root = tree<StoryboardNode>()
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
      HierarchyPointNode<StoryboardNode>
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
      .join("g")
      .attr("class", d =>
        classNames(
          styles.link,
          [d.target.data.type, (d.target.data as any).brickType]
            .filter(Boolean)
            .map(type => styles[type])
        )
      );

    this.links
      .append("path")
      .attr("marker-end", `url(#${this.arrowMarkerId})`)
      .attr("d", linkFactory);

    this.links
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.target.y - 5)
      .attr("y", d => {
        const offset = 8;
        if (d.target.x > d.source.x) {
          return d.target.x + offset;
        }
        return d.target.x - offset;
      })
      .text(({ target }) => {
        switch (target.data.type) {
          case "brick":
            return target.data.brickType === "routed"
              ? [].concat(
                  computeRealRoutePath(
                    target.data.routeData.path,
                    storyboardTree.appData
                  )
                )[0]
              : target.data.slotName;
          case "routes":
            return target.data.slotName;
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
      .join("path")
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

    this.nodes = this.nodes
      .data(root.descendants())
      .join("g")
      .attr("class", d =>
        classNames(
          styles.node,
          {
            [styles.leaf]: !d.data.children,
            [styles.template]:
              d.data.type === "brick" && d.data.brickData.template,
            [styles.provider]: d.data.type === "brick" && d.data.brickData.bg
          },
          [d.data.type, (d.data as any).brickType]
            .filter(Boolean)
            .map(type => styles[type])
        )
      )
      .attr("transform", d => `translate(${d.y},${d.x})`);

    const getSymbolType = (data: StoryboardNode): SymbolType => {
      switch (data.type) {
        case "app":
          return symbolCircle;
        case "brick":
          return symbolSquare;
        case "routes":
          return symbolDiamond;
      }
    };

    const symbolGenerator = symbol().size(200);

    const nodePath = this.nodes
      .append("path")
      .attr("d", d => symbolGenerator.type(getSymbolType(d.data))());

    if (options.handleNodeClick) {
      nodePath.classed(styles.clickable, true);
      nodePath.on("click", options.handleNodeClick);
    } else {
      nodePath.classed(styles.clickable, false);
      nodePath.on("click", null);
    }

    this.nodes
      .append("text")
      .attr("dy", "0.31em")
      .attr("y", "1.6em")
      .text(d => {
        switch (d.data.type) {
          case "app":
            return d.data.appData.name;
          case "brick":
            return getBrickName(d.data.brickData, options.showFullBrickName);
          // case "routes":
          //   return d.data.slotName;
        }
      });

    const legends = [
      {
        type: "brick",
        hasChildren: false,
        isTemplate: false,
        isProvider: false,
        name: "构件"
      },
      {
        type: "brick",
        hasChildren: true,
        name: "容器构件"
      },
      {
        type: "brick",
        hasChildren: false,
        isTemplate: true,
        isProvider: false,
        name: "模板"
      },
      {
        type: "brick",
        hasChildren: false,
        isTemplate: false,
        isProvider: true,
        name: "Provider"
      },
      {
        type: "routes",
        name: "路由"
      }
    ];

    const legendWidth = width / (legends.length + 1);
    const legendNode = this.legendsContainer
      .selectAll("g")
      .data(legends)
      .join("g")
      .attr("class", d =>
        classNames(
          styles.node,
          styles.legend,
          {
            [styles.leaf]: !d.hasChildren,
            [styles.template]: d.isTemplate,
            [styles.provider]: d.isProvider
          },
          [d.type].filter(Boolean).map(type => styles[type])
        )
      )
      .attr(
        "transform",
        (d, index) =>
          `translate(${(index + 0.75) * legendWidth} ${legendsHeight / 2})`
      );

    legendNode
      .append("path")
      .attr("d", d => symbolGenerator.type(getSymbolType(d as any))());

    legendNode
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", 25)
      .text(d => d.name);
  }

  toggleBrickFullName(showFullBrickName: boolean): void {
    this.nodes.each(function(node) {
      if (node.data.type === "brick") {
        select(this)
          .select("text")
          .text(getBrickName(node.data.brickData, showFullBrickName));
      }
    });
  }
}
