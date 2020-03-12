import React from "react";
import { shallow } from "enzyme";
import { GeneralIcon } from "@libs/basic-components";
import { FaIcon } from "@easyops/brick-types";
import { GraphNodeComponent, ContentItem } from "./GraphNodeComponent";
import { GraphNode, ViewItem } from "./interfaces";
import { fakeBuilderGraphNode } from "../fakesForTest";

describe("GraphNodeComponent", () => {
  it("should work for brick node", () => {
    const node: GraphNode = fakeBuilderGraphNode();

    const wrapper = shallow(<GraphNodeComponent node={node} />);

    expect(wrapper.prop("style")).toMatchObject({
      left: -100,
      top: -97.5,
      width: 200,
      height: 195
    });

    expect(wrapper.find("ContentItem").length).toBe(3);
  });

  it("should work for route node", () => {
    const node: GraphNode = {
      nodeType: "route",
      content: {
        type: "bricks",
        items: [
          {
            alias: "brick: 1",
            type: "brick"
          }
        ]
      },
      originalData: {
        alias: "route: bricks",
        type: "bricks",
        children: [
          {
            alias: "brick: 1",
            type: "brick"
          }
        ]
      },
      height: 88,
      children: []
    };

    const wrapper = shallow(<GraphNodeComponent node={node} />);
    expect(wrapper.find("ContentItem").length).toBe(1);
  });

  it("should work for node without content", () => {
    const node: GraphNode = {
      nodeType: "route",
      originalData: {
        alias: "route: empty",
        type: "bricks"
      },
      height: 56,
      children: []
    };

    const wrapper = shallow(<GraphNodeComponent node={node} />);
    expect(wrapper.find("ContentItem").length).toBe(0);
  });
});

describe("ContentItem", () => {
  it("should work", () => {
    const item: ViewItem = {
      alias: "route: empty",
      type: "bricks"
    };
    const wrapper = shallow(<ContentItem type="routes" item={item} />);

    function findItemIcon(): string {
      return (wrapper
        .find(".contentItemIcon")
        .find(GeneralIcon)
        .prop("icon") as FaIcon).icon;
    }

    expect(wrapper.prop("style").marginBottom).toBe(7);
    expect(findItemIcon()).toBe("code-branch");
    expect(wrapper.prop("className")).toBe("contentItem contentItemTypeRoute");
    expect(wrapper.find(".contentItemToolbar").length).toBe(0);

    wrapper.setProps({
      isLast: true
    });
    expect(wrapper.prop("style").marginBottom).toBe(0);

    wrapper.setProps({
      type: "bricks"
    });
    expect(findItemIcon()).toBe("puzzle-piece");

    wrapper.setProps({
      type: "unknown"
    });
    expect(findItemIcon()).toBe("question");

    wrapper.setProps({
      contentItemActions: {
        useBrick: [
          {
            brick: "div",
            properties: {
              textContent: "first"
            },
            events: {
              click: {
                action: "message.success",
                args: ["good"]
              }
            }
          },
          {
            brick: "div",
            properties: {
              textContent: "second"
            },
            events: {
              click: {
                action: "message.warn",
                args: ["bad"]
              }
            }
          }
        ]
      }
    });

    expect(wrapper.prop("className")).toBe(
      "contentItem contentItemEllipsisButtonAvailable"
    );
    expect(wrapper.find(".contentItemToolbar").length).toBe(1);
  });
});
