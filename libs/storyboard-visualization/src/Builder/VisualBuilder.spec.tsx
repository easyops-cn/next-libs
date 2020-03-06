import React from "react";
import { mount } from "enzyme";
import { VisualBuilder } from "./VisualBuilder";
import { BuilderVisualization } from "./BuilderVisualization";

jest.mock("./BuilderVisualization");

const render = jest.fn();
(BuilderVisualization as jest.Mock).mockImplementation(() => ({
  getDOMNode: () =>
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  render
}));

describe("VisualBuilder", () => {
  it("should work", () => {
    const wrapper = mount(<VisualBuilder data={null} />);
    expect(render).toBeCalledTimes(1);

    wrapper.setProps({
      data: []
    });
    expect(render).toBeCalledTimes(2);
  });
});
