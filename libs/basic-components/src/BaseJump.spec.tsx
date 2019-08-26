import React from "react";
import { shallow } from "enzyme";
import { BaseJump, LegacyBaseJump } from "./BaseJump";
import { InstanceApi } from "@sdk/cmdb-sdk";

jest.mock("@sdk/cmdb-sdk");
describe("BrickInstanceJump", () => {
  let wrapper: any;
  let component: LegacyBaseJump;
  beforeAll(() => {
    wrapper = shallow(
      <BaseJump nameKey="name" title="xxx" fetchData={() => {}} />
    );
    component = wrapper.instance() as LegacyBaseJump;
  });
  it("should work", () => {
    expect(wrapper).toMatchSnapshot();
  });
  it("setWrapperRef should work", () => {
    component.setWrapperRef("xxx");
    expect(component.wrapperRef).toEqual("xxx");
  });
  it("handleClickOutside", () => {
    const spyOnSetState = jest.spyOn(component, "setState");
    component.wrapperRef = {};
    component.wrapperRef.contains = () => false;
    component.handleClickOutside({ target: "xxx" } as any);
    expect(spyOnSetState).toBeCalledWith({
      _show: false
    });
  });
  it("toggleElementState should work", () => {
    const spyOnSetState = jest.spyOn(component, "setState");
    component.toggleElementState();
    expect(spyOnSetState).toBeCalled();
  });
  it("handleSearchInstance should work", async () => {
    jest
      .spyOn(InstanceApi, "postSearch")
      // eslint-disable-next-line
      .mockResolvedValue({ list: [], total: 0, page: 1, page_size: 10 });

    await component.componentDidMount();
    const spyOnBackQueryInstanceList = jest.spyOn(
      component,
      "fetchInstanceList"
    );
    component.handleSearchInstance({ target: { value: "xxx" } } as any);
    await jest.runAllTimers();
    expect(spyOnBackQueryInstanceList).toBeCalledWith("xxx");
  });
});
