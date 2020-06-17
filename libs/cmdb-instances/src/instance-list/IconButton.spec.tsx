import React from "react";
import { mount } from "enzyme";
import { IconButton } from "./IconButton";
import { Tooltip } from "antd";

jest.mock("i18next", () => ({
  addResourceBundle: () => {
    /* nothing to do */
  },
}));

describe("IconButton", () => {
  it("showHiddenInfo should work", () => {
    const wrapper = mount(
      <IconButton
        checked={false}
        onChange={jest.fn()}
        style={{ marginRight: 10 }}
        type="showHiddenInfo"
        label="省略信息"
      />
    );
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      '点击显示"省略信息"'
    );
    wrapper.find(Tooltip).at(0).children().at(0).simulate("click");
    wrapper.update();
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      '点击隐藏"省略信息"'
    );
  });

  it("showHiddenInfo should work", () => {
    const wrapper = mount(
      <IconButton
        checked={false}
        onChange={jest.fn()}
        style={{ marginRight: 10 }}
        type="relateToMe"
        label="与我有关"
      />
    );
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      '点击筛选"与我有关"'
    );
    wrapper.find(Tooltip).at(0).children().at(0).simulate("click");
    wrapper.update();
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      '点击取消筛选"与我有关"'
    );
  });
  it("showHiddenInfo should work", () => {
    const wrapper = mount(
      <IconButton
        checked={false}
        onChange={jest.fn()}
        style={{ marginRight: 10 }}
        type="normalHost"
        label="正常主机"
      />
    );
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      '点击筛选"正常主机"'
    );
    wrapper.find(Tooltip).at(0).children().at(0).simulate("click");
    wrapper.update();
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      '点击取消筛选"正常主机"'
    );
  });
});
