import React from "react";
import { mount, shallow } from "enzyme";
import { Button } from "antd";
import { ItemActionsComponent } from "./ItemActionsComponent";
import { ItemActionsMenu } from "./ItemActionsMenu";

const actions = [
  {
    brick: "div",
    properties: {
      textContent: "Add View",
    },
  },
  {
    brick: "div",
    properties: {
      textContent: "Edit Route",
    },
  },
];

describe("ItemActionsComponent", () => {
  it("should work", async () => {
    const mockedOnVisibleChange = jest.fn();
    const wrapper = mount(
      <ItemActionsComponent
        item={{ id: 1, name: 1 }}
        filteredActions={actions}
        onVisibleChange={mockedOnVisibleChange}
      />
    );
    expect(mockedOnVisibleChange).not.toBeCalled();
    wrapper.find("Button").simulate("click", {
      clientX: 100,
      clientY: 200,
    });
    expect(mockedOnVisibleChange).toHaveBeenNthCalledWith(1, true);
    expect(wrapper.find(ItemActionsMenu).prop("visible")).toBe(true);
    wrapper.update();
    expect(wrapper.find("BrickAsComponent").length).toBe(2);
    wrapper.find(ItemActionsMenu).invoke("onClick")(null);
    expect(mockedOnVisibleChange).toHaveBeenNthCalledWith(2, false);
  });

  it("should work when setting button shape and type", async () => {
    const wrapper = shallow(<ItemActionsComponent filteredActions={actions} />);
    expect(wrapper.find(Button).prop("shape")).toBe(undefined);
    expect(wrapper.find(Button).prop("type")).toBe("link");

    wrapper.setProps({
      buttonShape: "circle",
      buttonType: "primary",
    });
    expect(wrapper.find(Button).prop("shape")).toBe("circle");
    expect(wrapper.find(Button).prop("type")).toBe("primary");
  });

  it("should work when action is empty", async () => {
    const wrapper = shallow(<ItemActionsComponent filteredActions={[]} />);
    expect(wrapper.html()).toBe(null);
  });
});
