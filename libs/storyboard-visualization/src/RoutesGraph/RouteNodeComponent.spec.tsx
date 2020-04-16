import React from "react";
import { mount } from "enzyme";
import { RouteNodeComponent } from "./RouteNodeComponent";
import { fakeRoutesGraphNodes, fakeContentItemActions } from "../fakesForTest";

describe("RouteNodeComponent", () => {
  it("should work", () => {
    const contentItemActions = fakeContentItemActions();
    const onNodeClick = jest.fn();
    const wrapper = mount(
      <RouteNodeComponent
        originalData={fakeRoutesGraphNodes()[0].originalData}
        contentItemActions={contentItemActions}
        onNodeClick={onNodeClick}
      />
    );
    expect(wrapper.children.length).toBeTruthy();
    expect(wrapper.find(".contentItemToolbar").length).toBe(1);
    wrapper.find(".contentItemToolbar").simulate("click");
    wrapper.find(".routeNodeContainer").simulate("click");
    expect(onNodeClick).toHaveBeenCalled();
  });
});
