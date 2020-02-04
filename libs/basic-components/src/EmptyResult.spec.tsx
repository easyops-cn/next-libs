import React from "react";
import { shallow } from "enzyme";
import { EmptyResult, EmptyResultStatus } from "./EmptyResult";

describe("EmptyResult", () => {
  it("should work", () => {
    const wrapper = shallow(
      <EmptyResult status={EmptyResultStatus.BrowserTooOld} />
    );
    expect(wrapper.children.length).toBeTruthy();
  });
});
