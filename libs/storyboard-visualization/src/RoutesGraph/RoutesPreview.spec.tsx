import React from "react";
import { mount } from "enzyme";
import { fakeRoutesGraphNodes, fakeContentItemActions } from "../fakesForTest";
import { RoutesPreview } from "./RoutesPreview";
import { ItemActionsComponent } from "@libs/basic-components";

describe("RoutesPreview", () => {
  it("should work", async () => {
    const fakeRoutes = fakeRoutesGraphNodes();
    const contentItemActions = fakeContentItemActions();
    const onDragEnd = jest.fn();
    const onNodeClick = jest.fn();
    const wrapper = mount(
      <RoutesPreview
        routes={fakeRoutes}
        onDragEnd={onDragEnd}
        contentItemActions={contentItemActions}
        onNodeClick={onNodeClick}
      />
    );
    expect(wrapper.find("Item").length).toBe(3);
    wrapper.find("Item").at(1).invoke<any>("getDraggingStatus")(
      true,
      fakeRoutes[1]
    );
    expect(onDragEnd).not.toHaveBeenCalled();
    wrapper.find("Item").at(1).invoke<any>("getDraggingStatus")(
      false,
      fakeRoutes[1],
      {
        x: 300,
        y: 300,
      }
    );
    expect(onDragEnd).toHaveBeenCalled();
    expect(wrapper.find(".contentItemToolbar").length).toBe(3);
    wrapper.find(".contentItemToolbar").at(0).simulate("click");
    expect(wrapper.find(".previewTag").length).toBe(3);
    wrapper.find(".previewTag").at(0).simulate("click");
    expect(onNodeClick).toHaveBeenCalled();
    wrapper.find(ItemActionsComponent).first().invoke("onVisibleChange")(true);
    expect(
      wrapper
        .find(".previewTag")
        .first()
        .prop("className")
        .includes("actionsVisible")
    ).toBe(true);
  });
});
