import React from "react";
import { mount } from "enzyme";
import { Storyboard } from "@next-core/brick-types";
import { VisualStoryboard } from "./VisualStoryboard";
import { Visualization } from "../Visualization";
import { EditBrickNode } from "./EditBrickNode";
import { EditRoutesNode } from "./EditRoutesNode";

jest.mock("../Visualization");

const render = jest.fn();
(Visualization as jest.Mock).mockImplementation(() => ({
  getDOMNode: () =>
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  render,
}));

describe("VisualStoryboard", () => {
  it("should work", () => {
    const storyboard: Storyboard = {
      app: {
        id: "a",
        name: "A",
        homepage: "/a",
      },
      routes: [],
    };
    const handleStoryboardUpdate = jest.fn();
    const wrapper = mount(
      <VisualStoryboard
        storyboard={storyboard}
        onStoryboardUpdate={handleStoryboardUpdate}
      />
    );
    expect(render).toBeCalledTimes(1);

    wrapper.setProps({
      path: "/",
      editable: true,
    });
    expect(render).toBeCalledTimes(2);

    wrapper.find(EditBrickNode).invoke("onOk")();
    expect(render).toBeCalledTimes(3);
    expect(handleStoryboardUpdate).toBeCalledTimes(1);
    wrapper.find(EditBrickNode).invoke("onCancel")(null);

    wrapper.find(EditRoutesNode).invoke("onOk")();
    expect(render).toBeCalledTimes(4);
    expect(handleStoryboardUpdate).toBeCalledTimes(2);
    wrapper.find(EditRoutesNode).invoke("onCancel")(null);
  });
});
