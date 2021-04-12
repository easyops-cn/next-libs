import React from "react";
import { mount } from "enzyme";
import { RouteTypeIcon } from "./RouteTypeIcon";
import {
  BranchesOutlined,
  DesktopOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

describe("RouteTypeIcon", () => {
  it("should work", async () => {
    const wrapper = mount(<RouteTypeIcon item={{ type: "routes" }} />);
    expect(wrapper.find(BranchesOutlined).length).toBe(1);
    wrapper.setProps({
      item: { type: "bricks" },
    });
    wrapper.update();
    expect(wrapper.find(DesktopOutlined).length).toBe(1);
    wrapper.setProps({
      item: { type: "redirect" },
    });
    wrapper.update();
    expect(wrapper.find(ArrowRightOutlined).length).toBe(1);
  });
});
