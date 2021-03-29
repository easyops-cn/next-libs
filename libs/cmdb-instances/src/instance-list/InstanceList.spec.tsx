import "@testing-library/jest-dom/extend-expect";
import React from "react";
import {
  cleanup,
  render,
  waitForElement,
  fireEvent,
} from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { PropertyDisplayConfig } from "@next-core/brick-types";
import { InstanceApi } from "@next-sdk/cmdb-sdk";
import * as storage from "@next-libs/storage";
import { IconButton } from "./IconButton";

import { InstanceList, getQuery } from "./InstanceList";
import {
  getInstanceListData,
  mockFetchCmdbObjectDetailReturnValueCLuster,
} from "../__mocks__";
import {
  AdvancedSearch,
  InstanceListTable,
  MoreButtonsContainer,
  InstanceListTableProps,
} from "../instance-list-table";
import { InstanceListPresetConfigs } from "../instance-list/InstanceList";
import { mount, shallow } from "enzyme";
import { BrickAsComponent } from "@next-core/brick-kit";

jest.mock("@next-libs/storage");
jest.mock("@next-sdk/cmdb-sdk");
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
  LogicalOperators: {
    And: "$and",
    Or: "$or",
  }
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
    {
      id: "hostname",
      name: "主机名",
      protected: true,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: ["默认属性"],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0,
      },
      wordIndexDenied: false,
      isInherit: false,
      notifyDenied: false,
    },
    {
      id: "ip",
      name: "IP",
      protected: true,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: ["默认属性"],
      description: "",
      tips: "",
      value: {
        type: "ip",
        regex:
          "((^\\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\\s*$)|(^\\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(%.+)?\\s*$))",
        default_type: "",
        default: null,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0,
      },
      wordIndexDenied: true,
      isInherit: false,
      notifyDenied: false,
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
    const { findByText } = render(
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
        defaultQuery={[presetConfigs.query]}
      />
    );

    await findByText(mockInstanceListTableContent);

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
    const { findByText, queryByText, queryByTestId } = render(
      <InstanceList objectId="HOST" objectList={[HOST]} />
    );

    await findByText(mockInstanceListTableContent);

    const advancedSearchToggleBtn = queryByTestId("advanced-search-toggle-btn");
    const mockAdvancedSearchElement = queryByText(mockAdvancedSearchContent);
    expect(mockAdvancedSearchElement).not.toBeVisible();
    fireEvent.click(advancedSearchToggleBtn);
    expect(mockAdvancedSearchElement).toBeVisible();
  });

  it("should call onRelatedToMeChange when change relatedToMe ", async () => {
    const mockOnRelatedToMeChange = jest.fn();
    const wrapper = mount(
      <InstanceList
        objectId="HOST"
        objectList={[HOST]}
        relatedToMe={true}
        onRelatedToMeChange={mockOnRelatedToMeChange}
        relationLinkDisabled={true}
      />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    const relatedToMe = wrapper.find("IconButton").get(1);
    expect(relatedToMe.props["checked"]).toBeTruthy();
    wrapper.find(IconButton).at(1).invoke("onChange")(false);
    expect(mockOnRelatedToMeChange).toBeCalledWith(false);
  });

  it("should call onAliveHostsChange when change aliveHosts", async () => {
    const mockOnAliveHostsChange = jest.fn();
    const presetConfigs: InstanceListPresetConfigs = {
      query: { status: "运营中" },
      fieldIds: ["hostname", "ip", "_deviceList_CLUSTER"],
    };
    const wrapper = mount(
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
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();

    const aliveHosts = wrapper.find("IconButton").get(0);
    expect(aliveHosts.props["checked"]).toBeTruthy();
    wrapper.find(IconButton).at(0).invoke("onChange")(false);
    expect(mockOnAliveHostsChange).toBeCalledWith(false);
  });

  it("check getQuery should pass", async () => {
    const testdata: Record<string, any>[] = [
      {
        q: "aaa",
        fields: ["backupowner", "ip"],
        expected: {
          $or: [
            { ip: { $like: "%aaa%" } },
            { "backupowner.name": { $like: "%aaa%" } },
          ],
        },
      },
      {
        q: "aaa",
        fields: ["hostname"],
        expected: { $or: [{ hostname: { $like: "%aaa%" } }] },
      },
    ];
    testdata.forEach((t) => {
      expect(getQuery(HOST, { HOST: HOST }, t.q, t.fields)).toEqual(t.expected);
    });
  });

  it("should call works with cluster", async () => {
    const mockOnRelatedToMeChange = jest.fn();
    const presetConfigs: InstanceListPresetConfigs = {
      fieldIds: ["name", "type"],
    };
    const wrapper = mount(
      <InstanceList
        objectId="CLUSTER"
        objectList={[mockFetchCmdbObjectDetailReturnValueCLuster]}
        relatedToMe={true}
        onRelatedToMeChange={mockOnRelatedToMeChange}
        relationLinkDisabled={true}
      />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    const relatedToMe = wrapper.find("IconButton").get(0);
    expect(relatedToMe.props["checked"]).toBeTruthy();
    wrapper.find(IconButton).at(0).invoke("onChange")(false);
    expect(mockOnRelatedToMeChange).toBeCalledWith(false);
  });

  it("should work with extraFilterBricks property", async () => {
    const extraFilterBricks = {useBrick: {brick: 'span'}};
    const wrapper = mount(
      <InstanceList
        objectId="HOST"
        objectList={[HOST]}
        extraFilterBricks={extraFilterBricks}
      />
    );

    await (global as any).flushPromises();
    wrapper.update();

    const brickAsComponentProps = wrapper.find(BrickAsComponent).props();
    expect(brickAsComponentProps.useBrick).toBe(extraFilterBricks.useBrick);
  });
});
