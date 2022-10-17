import React from "react";
import { shallow } from "enzyme";
import { EmptyResult } from "./EmptyResult";
import { EmptyResultStatus } from "./EmptyResultStatus";

describe("EmptyResult", () => {
  it("should work", () => {
    const wrapper = shallow(
      <EmptyResult status={EmptyResultStatus.BrowserTooOld} />
    );
    expect(wrapper.children.length).toBeTruthy();
  });
});
