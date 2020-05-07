import "@testing-library/jest-dom/extend-expect";
import React from "react";
import {
  cleanup,
  render,
  waitForElement,
  fireEvent,
} from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { PropertyDisplayConfig } from "@easyops/brick-types";
import { InstanceApi } from "@sdk/cmdb-sdk";
import * as storage from "@libs/storage";

import { InstanceList } from "./InstanceList";
import { getInstanceListData } from "../__mocks__";
import {
  AdvancedSearch,
  InstanceListTable,
  MoreButtonsContainer,
  InstanceListTableProps,
} from "../instance-list-table";
import { InstanceListPresetConfigs } from "../instance-list/InstanceList";

jest.mock("@libs/storage");
jest.mock("@sdk/cmdb-sdk");
jest.mock("../instance-list-table", () => ({
  AdvancedSearch: jest.fn(() => {
    return "<div>Fake advanced search loaded!</div>";
  }),
  InstanceListTable: jest.fn(() => {
    return "<div>Fake instance list table loaded!</div>";
  }),
  MoreButtonsContainer: jest.fn(() => {
    return "<div>Fake more buttons container loaded!</div>";
  }),
}));

const instanceListData = getInstanceListData();
const mockAdvancedSearch = (AdvancedSearch as any) as jest.Mock;
const mockAdvancedSearchContent = mockAdvancedSearch();
const mockInstanceListTable = InstanceListTable as jest.Mock;
const mockInstanceListTableContent = mockInstanceListTable();
const mockMoreButtonsContainer = MoreButtonsContainer as jest.Mock;

jest.spyOn(InstanceApi, "postSearch").mockResolvedValue(instanceListData);
const HOST: any = {
  objectId: "HOST",
  view: {
    attr_order: [
      "ip",
      "_agentStatus",
      "cpu",
      "cpuHz",
      "cpuModel",
      "cpus",
      "diskSize",
    ],
  },
  attrList: [
    {
      id: "__pipeline",
      name: "流水线信息",
      protected: true,
    },
  ],
  relation_list: [
    {
      left_description: "负责备份的主机",
      left_groups: ["_user", "basic_info"],
      left_id: "backupowner",
      left_max: -1,
      left_min: 0,
      left_name: "备份负责人",
      left_object_id: "HOST",
      left_tags: [],
      name: "",
      protected: false,
      relation_id: "HOST_backupowner_USER",
      right_description: "备份负责人",
      right_groups: [],
      right_id: "_backupowner_HOST",
      right_max: -1,
      right_min: 0,
      right_name: "负责备份的主机",
      right_object_id: "USER",
      right_tags: [],
      _version: 0,
    },
  ],
};

afterEach(cleanup);

describe("InstanceList", () => {
  beforeAll(() => {
    (storage.JsonStorage as jest.Mock)
      .mockImplementationOnce(() => ({
        getItem: jest.fn(() => [
          "ip",
          "_agentStatus",
          "memSize",
          "hostname",
          "_deviceList_CLUSTER",
        ]),
      }))
      .mockImplementationOnce(() => ({
        getItem: () => [] as any,
      }));
  });

  it("should call searchCmdbInstances and pass data to SimpleSearch and InstanceListTable", async () => {
    const objectId = "HOST";
    const modelData = HOST;
    const idObjectMap = { [objectId]: modelData };
    const presetConfigs: InstanceListPresetConfigs = {
      query: { status: "运营中" },
      fieldIds: ["hostname", "ip", "_deviceList_CLUSTER"],
    };
    const page = 1;
    const pageSize = 20;
    const sort = "name";
    const asc = true;
    const q = "aaa";
    const propertyDisplayConfigs: PropertyDisplayConfig[] = [];
    const onSearch = jest.fn();
    const onClickItem = jest.fn();
    const onPaginationChange = jest.fn();
    const onSortingChange = jest.fn();
    const onSelectionChange = jest.fn();
    const { queryByText } = render(
      <InstanceList
        objectId={objectId}
        objectList={[HOST]}
        presetConfigs={presetConfigs}
        page={page}
        pageSize={pageSize}
        sort={sort}
        asc={asc}
        q={q}
        propertyDisplayConfigs={propertyDisplayConfigs}
        onSearch={onSearch}
        onClickItem={onClickItem}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onSelectionChange={onSelectionChange}
        relationLinkDisabled={false}
      />
    );
    await waitForElement(() => queryByText(mockInstanceListTableContent));

    const fields: Record<string, boolean> = {};
    const newFieldIds = ["hostname", "ip", "_deviceList_CLUSTER"];
    newFieldIds.forEach((id) => (fields[id] = true));

    expect(mockInstanceListTable).toBeCalled();
    expect(mockMoreButtonsContainer).toBeCalled();
    const instanceListTableProps: InstanceListTableProps =
      mockInstanceListTable.mock.calls[
        mockInstanceListTable.mock.calls.length - 1
      ][0];
    expect(instanceListTableProps.idObjectMap).toEqual(idObjectMap);
    expect(instanceListTableProps.modelData).toBe(modelData);
    expect(instanceListTableProps.instanceListData).toBe(instanceListData);
    expect(instanceListTableProps.sort).toBe(sort);
    expect(instanceListTableProps.asc).toBe(asc);
    expect(instanceListTableProps.propertyDisplayConfigs).toBe(
      propertyDisplayConfigs
    );
    expect(instanceListTableProps.fieldIds).toEqual(newFieldIds);
    expect(instanceListTableProps.onClickItem).toBe(onClickItem);
  });

  it("should toggle advanced search when click advanced-search-toggle-btn", async () => {
    const { queryByText, queryByTestId } = render(
      <InstanceList objectId="HOST" objectList={[HOST]} />
    );
    await waitForElement(() => queryByText(mockInstanceListTableContent));

    const advancedSearchToggleBtn = queryByTestId("advanced-search-toggle-btn");
    const mockAdvancedSearchElement = queryByText(mockAdvancedSearchContent);
    expect(mockAdvancedSearchElement).not.toBeVisible();
    fireEvent.click(advancedSearchToggleBtn);
    expect(mockAdvancedSearchElement).toBeVisible();
  });

  it("should call onRelatedToMeChange when change relatedToMe checkbox", async () => {
    const mockOnRelatedToMeChange = jest.fn();
    const { queryByTestId } = render(
      <InstanceList
        objectId="HOST"
        objectList={[HOST]}
        relatedToMe={true}
        onRelatedToMeChange={mockOnRelatedToMeChange}
        relationLinkDisabled={true}
      />
    );
    await waitForElement(() => queryByTestId("related-to-me-checkbox"));
    const relatedToMeCheckbox = queryByTestId("related-to-me-checkbox");
    expect((relatedToMeCheckbox as HTMLInputElement).checked).toBe(true);
    await act(async () => {
      fireEvent.click(relatedToMeCheckbox.closest("label"));
    });
    expect(mockOnRelatedToMeChange).toBeCalledWith(false);
  });

  it("should call onAliveHostsChange when change aliveHosts checkbox", async () => {
    const mockOnAliveHostsChange = jest.fn();
    const presetConfigs: InstanceListPresetConfigs = {
      query: { status: "运营中" },
      fieldIds: ["hostname", "ip", "_deviceList_CLUSTER"],
    };
    const { queryByTestId } = render(
      <InstanceList
        objectId="HOST"
        objectList={[HOST]}
        aliveHosts={true}
        onAliveHostsChange={mockOnAliveHostsChange}
        asc={false}
        presetConfigs={presetConfigs}
        aq={[]}
        searchDisabled={true}
        relatedToMeDisabled={true}
        advancedSearchDisabled={true}
        notifyCurrentFields={jest.fn()}
      />
    );
    await waitForElement(() => queryByTestId("alive-hosts-checkbox"));
    const aliveHostsCheckbox = queryByTestId("alive-hosts-checkbox");
    expect((aliveHostsCheckbox as HTMLInputElement).checked).toBe(true);
    await act(async () => {
      fireEvent.click(aliveHostsCheckbox.closest("label"));
    });
    expect(mockOnAliveHostsChange).toBeCalledWith(false);
  });
});
