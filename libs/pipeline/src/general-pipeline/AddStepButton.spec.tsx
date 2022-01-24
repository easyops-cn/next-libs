import React from "react";
import { mount, shallow } from "enzyme";
import { AddStepButton } from "./AddStepButton";
import { Menu } from "antd";

describe("AddStepButton", () => {
  it("should work", () => {
    const onAddStepButtonClick = jest.fn();
    const wrapper = shallow(
      <AddStepButton
        addButtonProps={{
          name: "add",
          key: "aaa",
          disabled: true,
        }}
        onAddStepButtonClick={onAddStepButtonClick}
      />
    );
    wrapper.find(".addStepBtn").simulate("click");
    expect(onAddStepButtonClick).not.toBeCalled();

    wrapper.setProps({
      addButtonProps: {
        name: "add",
        key: "aaa",
        disabled: false,
      },
    });
    wrapper.update();
    wrapper.find(".addStepBtn").simulate("click");
    expect(onAddStepButtonClick).toHaveBeenLastCalledWith({
      hasSubButtons: false,
      key: "aaa",
    });
  });

  it("should work with subButtons", () => {
    const onAddStepButtonClick = jest.fn();
    const onSubButtonClick = jest.fn();
    const wrapper = mount(
      <AddStepButton
        addButtonProps={{
          name: "add",
          key: "aaa",
        }}
        subButtons={[
          {
            name: "sss",
            key: "sss",
          },
          {
            name: "qqq",
            key: "qqq",
          },
          {
            name: "eee",
            key: "eee",
            disabled: true,
          },
        ]}
        onAddStepButtonClick={onAddStepButtonClick}
        onSubButtonClick={onSubButtonClick}
      />
    );
    wrapper.find(".addStepBtn").simulate("click");
    expect(onAddStepButtonClick).toHaveBeenLastCalledWith({
      hasSubButtons: true,
      key: "aaa",
    });
    expect(wrapper.find(Menu.Item)).toHaveLength(3);
    wrapper.find(Menu.Item).at(1).simulate("click");
    expect(onSubButtonClick).toHaveBeenLastCalledWith({ key: ["aaa", "qqq"] });
  });

  it("should work when addButtonProps is nil", () => {
    const wrapper = shallow(<AddStepButton addButtonProps={{} as any} />);
    expect(wrapper.find(".addStepBtn")).toHaveLength(0);
  });
});
