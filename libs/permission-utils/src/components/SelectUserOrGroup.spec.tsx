import React from "react";
import { shallow } from "enzyme";
import { SelectUserOrGroup } from "./SelectUserOrGroup";
import { Select } from "antd";
import { exportDefaultDeclaration } from "@babel/types";
describe("SelectUserOrGroup", () => {
  const handleUsersChange = jest.fn();
  const props = { handleUsersChange };
  const wrapper = shallow(<SelectUserOrGroup {...props} />);
  const instance = wrapper.instance() as SelectUserOrGroup;
  it("should render", () => {
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(Select)).toHaveLength(1);
  });

  it("should handle change", () => {
    const spy = jest.spyOn(props, "handleUsersChange");
    instance.handleUsersChange([
      { label: "user", value: "12345", key: "12345" },
    ]);
    expect(spy).toHaveBeenCalled();
  });
  it("should work when call filterOpts function", () => {
    const allUsers = [
      {
        instanceId: "abc",
        name: "lightjiao",
      },
      {
        instanceId: "easyops",
        name: "easyops",
      },
      {
        instanceId: "willniu",
        name: "1234567",
      },
      {
        instanceId: "test",
        name: "12345678",
      },
    ];
    expect(instance.filterOpts(["lightjiao", "easyops"], allUsers)).toEqual([
      {
        instanceId: "abc",
        name: "lightjiao",
      },
      {
        instanceId: "easyops",
        name: "easyops",
      },
    ]);
  });
});
