import React from "react";
import { mount, shallow } from "enzyme";
import { StepItem } from "./StepItem";
import { Button } from "antd";

describe("StepItem", () => {
  it("should work", () => {
    const onStepItemClick = jest.fn();
    const wrapper = shallow(
      <StepItem
        title="title"
        icon={{
          lib: "antd",
          icon: "minus-circle",
          theme: "outlined",
        }}
        color="cyan"
        onStepItemClick={onStepItemClick}
      />
    );
    wrapper.find(".stepItem").simulate("click");
    expect(onStepItemClick).toHaveBeenLastCalledWith({
      hasOperateButtons: false,
      disabled: false,
    });
  });

  it("should work with operateButtons", () => {
    const onStepItemClick = jest.fn();
    const onOperateButtonClick = jest.fn();
    const wrapper = shallow(
      <StepItem
        title="title"
        icon={{
          lib: "antd",
          icon: "minus-circle",
          theme: "outlined",
        }}
        color="cyan"
        disabled={true}
        operateButtons={[
          {
            icon: {
              lib: "antd",
              icon: "minus-circle",
              theme: "outlined",
            },
            key: "aa",
            disabled: false,
          },
          {
            icon: {
              lib: "antd",
              icon: "minus-circle",
              theme: "outlined",
            },
            key: "bb",
            tooltip: "tooltip",
            disabled: true,
          },
        ]}
        onOperateButtonClick={onOperateButtonClick}
        onStepItemClick={onStepItemClick}
      />
    );
    wrapper.find(".stepItem").simulate("click", { clientX: 1, clientY: 1 });
    expect(onStepItemClick).toHaveBeenLastCalledWith({
      hasOperateButtons: true,
      disabled: true,
    });
    expect(wrapper.find(".operateList").prop("children")).toHaveLength(2);
    wrapper
      .find(".operateList")
      .at(0)
      .simulate("click", { stopPropagation: () => jest.fn() });
    wrapper.find(Button).at(0).simulate("click");
    expect(onOperateButtonClick).toHaveBeenLastCalledWith({ key: "aa" });
    wrapper.find(".operateWrapper").simulate("click");
    expect(wrapper.find(".operateList")).toHaveLength(0);
  });
});
