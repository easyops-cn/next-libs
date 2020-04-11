import React from "react";
import { shallow } from "enzyme";
import { RouteNodeComponent } from "./RouteNodeComponent";
import { fakeRoutesGraphNodes } from "../fakesForTest";

describe("RouteNodeComponent", () => {
  it("should work", () => {
    const wrapper = shallow(
      <RouteNodeComponent
        originalData={fakeRoutesGraphNodes()[0].originalData}
      />
    );
    expect(wrapper.children.length).toBeTruthy();
  });
});
