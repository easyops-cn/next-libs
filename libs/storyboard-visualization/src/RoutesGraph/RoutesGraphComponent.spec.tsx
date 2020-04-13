import React from "react";
import { mount } from "enzyme";
import { RoutesGraphComponent } from "./RoutesGraphComponent";
import { RoutesGraph } from "./RoutesGraph";

jest.mock("./RoutesGraph");

const render = jest.fn();
(RoutesGraph as jest.Mock).mockImplementation(() => ({
  getDOMNode: () =>
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  getRoutesPreviewNode: () =>
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  render
}));

describe("RoutesGraphComponent", () => {
  it("should work", () => {
    const wrapper = mount(<RoutesGraphComponent data={null} />);
    expect(render).toBeCalledTimes(1);

    wrapper.setProps({
      data: []
    });
    expect(render).toBeCalledTimes(2);
  });
});
