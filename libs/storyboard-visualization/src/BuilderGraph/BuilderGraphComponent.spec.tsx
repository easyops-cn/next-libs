import React from "react";
import { mount } from "enzyme";
import { BuilderGraphComponent } from "./BuilderGraphComponent";
import { BuilderGraph } from "./BuilderGraph";

jest.mock("./BuilderGraph");

const render = jest.fn();
(BuilderGraph as jest.Mock).mockImplementation(() => ({
  getDOMNode: () =>
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  render
}));

describe("BuilderGraphComponent", () => {
  it("should work", () => {
    const wrapper = mount(<BuilderGraphComponent data={null} />);
    expect(render).toBeCalledTimes(1);

    wrapper.setProps({
      data: []
    });
    expect(render).toBeCalledTimes(2);
  });
});
