import React from "react";
import { mount } from "enzyme";
import { RouteTypeIcon } from "./RouteTypeIcon";

describe("RouteTypeIcon", () => {
  it("should work", async () => {
    const wrapper = mount(<RouteTypeIcon item={{ type: "routes" }} />);
    expect(wrapper.find("Icon").length).toBe(1);
    expect(wrapper.find("Icon").prop("type")).toBe("branches");
    wrapper.setProps({
      item: { type: "bricks" },
    });
    wrapper.update();
    expect(wrapper.find("Icon").prop("type")).toBe("desktop");
    wrapper.setProps({
      item: { type: "redirect" },
    });
    wrapper.update();
    expect(wrapper.find("Icon").prop("type")).toBe("arrow-right");
  });
});
