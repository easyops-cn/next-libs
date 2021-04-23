import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { shallow } from "enzyme";
import { keyBy } from "lodash";
import { InstanceListModal } from "./InstanceListModal";
import { getInstanceListData } from "../instance-list-table/data-providers/__mocks__";
import { mockFetchCmdbObjectListReturnValue } from "../__mocks__";
import { InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
jest.mock("@next-sdk/cmdb-sdk");

jest.mock("../i18n");
jest.spyOn(i18n, "t").mockReturnValue("");
const mockInstanceListData = InstanceApi_postSearch as jest.Mock;

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
});
