import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { shallow, mount } from "enzyme";
import { keyBy } from "lodash";
import { InstanceListModal } from "./InstanceListModal";
import { getInstanceListData } from "../instance-list-table/data-providers/__mocks__";
import { mockFetchCmdbObjectListReturnValue } from "../__mocks__";
import { InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { Button } from "antd";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import * as kit from "@next-core/brick-kit";
jest.mock("@next-sdk/cmdb-sdk");

jest.mock("../i18n");
jest.spyOn(i18n, "t").mockReturnValue("");
const mockInstanceListData = InstanceApi_postSearch as jest.Mock;

const flags: Record<string, boolean> = {};
jest.spyOn(kit, "getRuntime").mockReturnValue({
  getFeatureFlags: () => flags,
  getMiscSettings: () => {
    return {
      defaultRelationLimit: 5,
    };
  },
} as any);

mockInstanceListData.mockResolvedValue(getInstanceListData);

describe("InstanceListModal", () => {
  it("should render InstanceListModal", async () => {
    const objectList = mockFetchCmdbObjectListReturnValue;
    const objectMap = keyBy(objectList, "objectId");
    const handleInstancesSelected = jest.fn();
    const closeModal = jest.fn();
    const wrapper = shallow(
      <InstanceListModal
        objectMap={objectMap}
        objectId="CLUSTER"
        visible={true}
        title="从 CMDB 中筛选"
        onSelected={handleInstancesSelected}
        onCancel={closeModal}
      />
    );
    expect(wrapper.find("Modal").props().title).toBe("从 CMDB 中筛选");
  });
  it("should render InstanceListModal and selectDisabled ", async () => {
    const objectList = mockFetchCmdbObjectListReturnValue;
    const objectMap = keyBy(objectList, "objectId");
    const handleInstancesSelected = jest.fn();
    const closeModal = jest.fn();
    const wrapper = mount(
      <InstanceListModal
        objectMap={objectMap}
        objectId="CLUSTER"
        visible={true}
        title="从 CMDB 中筛选"
        onSelected={handleInstancesSelected}
        onCancel={closeModal}
        selectDisabled={true}
      />
    );
    expect(wrapper.find(Button).length).toBe(1);
    expect(wrapper.find(Button).at(0).text()).toBe(
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLOSE}`)
    );
    wrapper.setProps({
      selectDisabled: false,
    });
    wrapper.update();
    expect(wrapper.find(Button).length).toBe(2);
  });
});
