import React from "react";
import { mount } from "enzyme";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { IconButton } from "./IconButton";
import { Tooltip } from "antd";

// jest.mock("i18next", () => ({
//   addResourceBundle: () => {
//     /* nothing to do */
//   },
// }));
jest.mock("../i18n");
jest.spyOn(i18n, "t").mockReturnValue("");
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
      // '点击显示"省略信息"'
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_SHOW}`, {
        label: "省略信息",
      })
    );
    wrapper.find(Tooltip).at(0).children().at(0).simulate("click");
    wrapper.update();
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      // '点击隐藏"省略信息"'
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_HIDDEN}`, {
        label: "省略信息",
      })
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
      // '点击筛选"与我有关"'
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_FILTER}`, {
        label: "与我有关",
      })
    );
    wrapper.find(Tooltip).at(0).children().at(0).simulate("click");
    wrapper.update();
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      // '点击取消筛选"与我有关"'
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_CANCEL_FILTER}`, {
        label: "与我有关",
      })
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
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_FILTER}`, {
        label: "正常主机",
      })
    );
    wrapper.find(Tooltip).at(0).children().at(0).simulate("click");
    wrapper.update();
    expect(wrapper.find(Tooltip).get(0).props["title"]).toBe(
      // '点击取消筛选"正常主机"'
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_CANCEL_FILTER}`, {
        label: "正常主机",
      })
    );
  });
});
