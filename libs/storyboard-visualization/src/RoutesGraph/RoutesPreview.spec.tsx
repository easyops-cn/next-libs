import React from "react";
import { mount } from "enzyme";
import { fakeRoutesGraphNodes } from "../fakesForTest";
import { RoutesPreview } from "./RoutesPreview";

describe("RoutesPreview", () => {
  it("should work", async () => {
    const fackRoutes = fakeRoutesGraphNodes();
    const onDragEnd = jest.fn();
    const wrapper = mount(
      <RoutesPreview routes={fackRoutes} onDragEnd={onDragEnd} />
    );
    expect(wrapper.find("Item").length).toBe(3);
    wrapper
      .find("Item")
      .at(1)
      .invoke<any>("getDraggingStatus")(true, fackRoutes[1]);
    expect(onDragEnd).not.toHaveBeenCalled();
    wrapper
      .find("Item")
      .at(1)
      .invoke<any>("getDraggingStatus")(false, fackRoutes[1], {
      x: 300,
      y: 300
    });
    expect(onDragEnd).toHaveBeenCalled();
  });
});
