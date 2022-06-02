import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { PropertyDisplayConfig } from "@next-core/brick-types";
import {
  InstanceApi_postSearchV3,
  CmdbObjectApi_getIdMapName,
} from "@next-sdk/cmdb-sdk";
import * as storage from "@next-libs/storage";
import { Button, Select } from "antd";
import { mount } from "enzyme";
import { BrickAsComponent } from "@next-core/brick-kit";
import i18n from "i18next";
import { Query } from "@next-libs/cmdb-utils";
import { IconButton } from "./IconButton";
import { InstanceList, getQuery, initAqToShow } from "./InstanceList";
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

jest.mock("../i18n");
jest.spyOn(i18n, "t").mockReturnValue("");
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
  },
  getFieldConditionsAndValues: jest.fn(() => {
    return {
      availableConditions: [
        {
          type: "contain",
          label: "包含",
          operations: [
            {
              operator: "$like",
              prefix: "%",
              suffix: "%",
            },
          ],
        },
        {
          type: "notContain",
          label: "不包含",
          operations: [
            {
              operator: "$nlike",
              prefix: "%",
              suffix: "%",
            },
          ],
        },
        {
          type: "equal",
          label: "等于",
          operations: [
            {
              operator: "$eq",
            },
          ],
        },
        {
          type: "notEqual",
          label: "不等于",
          operations: [
            {
              operator: "$ne",
            },
          ],
        },
        {
          type: "between",
          label: "范围",
          operations: [
            {
              operator: "$gte",
            },
            {
              operator: "$lte",
            },
          ],
        },
        {
          type: "empty",
          label: "为空",
          operations: [
            {
              operator: "$exists",
              fixedValue: false,
            },
          ],
        },
        {
          type: "notEmpty",
          label: "不为空",
          operations: [
            {
              operator: "$exists",
              fixedValue: true,
            },
          ],
        },
      ],
      currentCondition: {
        type: "contain",
        label: "包含",
        operations: [
          {
            operator: "$like",
            prefix: "%",
            suffix: "%",
          },
        ],
      },
      values: ["192.168.100.162"],
      queryValuesStr: "%192.168.100.162%",
      disabled: false,
    };
  }),
  ConditionType: {
    Equal: "equal",
    NotEqual: "notEqual",
    Contain: "contain",
    NotContain: "notContain",
    Empty: "empty",
    NotEmpty: "notEmpty",
    Between: "between",
    True: "true",
    False: "false",
  },
  ElementOperators: {
    Exists: "$exists",
  },
}));

const instanceListData = getInstanceListData();
const mockAdvancedSearch = AdvancedSearch as any as jest.Mock;
const mockAdvancedSearchContent = mockAdvancedSearch();
const mockInstanceListTable = InstanceListTable as jest.Mock;
const mockInstanceListTableContent = mockInstanceListTable();
const mockMoreButtonsContainer = MoreButtonsContainer as jest.Mock;
const mockCmdbObjectApi_getIdMapName = CmdbObjectApi_getIdMapName as jest.Mock;

// (InstanceApi_postSearchV3 as jest.Mock).mockResolvedValue(instanceListData);
(InstanceApi_postSearchV3 as jest.Mock).mockImplementation((r, v) => {
  if (r !== "APP") {
    return instanceListData;
  } else {
    return [
      {
        _object_id: "APP",
        clusters: [
          {
            _deployType: "default",
            _object_id: "CLUSTER",
            _object_version: 25,
            _ts: 1625814682,
            _version: 1,
            clusterId: "5c6ab7a9897c1",
            creator: "easyops",
            ctime: "2021-07-09 15:11:22",
            instanceId: "5c6ab7a9897c1",
            name: "0709test",
            org: 2988466,
            type: "0",
          },
        ],
        instanceId: "5c6ab79aa162e",
        name: "0709test",
      },
    ];
  }
});

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
      value: {
        type: "str",
        regex: null,
        default_type: "",
        default: null,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0,
      },
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
    {
      id: "cpu",
      name: "CPU信息",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "struct",
        regex: null,
        default_type: "",
        default: null,
        struct_define: [
          {
            id: "brand",
            name: "型号",
            type: "str",
            regex: null,
            protected: true,
          },
          {
            id: "architecture",
            name: "架构",
            type: "str",
            regex: null,
            protected: true,
          },
          {
            id: "hz",
            name: "频率",
            type: "str",
            regex: null,
            protected: true,
          },
          {
            id: "logical_cores",
            name: "逻辑核数",
            type: "int",
            regex: null,
            protected: true,
          },
          {
            id: "physical_cores",
            name: "物理核数",
            type: "int",
            regex: null,
            protected: true,
          },
        ],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0,
      },
      wordIndexDenied: false,
    },
    {
      id: "testSort",
      name: "流水号",
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
        default_type: "series-number",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "aa",
        start_value: 0,
        series_number_length: 2,
      },
      wordIndexDenied: false,
      isInherit: false,
      notifyDenied: false,
    },
    {
      id: "bool",
      name: "布尔值",
      protected: true,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: ["默认属性"],
      description: "",
      tips: "",
      value: {
        type: "bool",
        regex: null,
        default_type: "",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "aa",
        start_value: 0,
        series_number_length: "",
      },
      wordIndexDenied: false,
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
    const sort = "testSort";
    const asc = true;
    const q = "aaa";
    const propertyDisplayConfigs: PropertyDisplayConfig[] = [];
    const onSearch = jest.fn();
    const onClickItem = jest.fn();
    const onPaginationChange = jest.fn();
    const onSortingChange = jest.fn();
    const onSelectionChange = jest.fn();
    const extraDisabledField = "hostname";
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
        extraDisabledField={extraDisabledField}
      />
    );

    await act(async () => {
      await (global as any).flushPromises();
    });
    findByText(mockInstanceListTableContent);

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

    expect(InstanceApi_postSearchV3).toBeCalledWith(objectId, {
      fields: ["hostname", "ip", "_deviceList_CLUSTER", "instanceId"],
      ignore_missing_field_error: true,
      page: page,
      page_size: pageSize,
      query: {
        $and: [
          {
            $and: [{ status: "运营中" }],
            $or: [{ hostname: { $like: "%aaa%" } }, { ip: { $like: "%aaa%" } }],
          },
          { status: "运营中" },
        ],
      },
      sort: [{ key: sort, order: 2 }],
    });
  });

  it("should work when model's isAbstract is true", async () => {
    const objectId = "HOST";
    const modelData = { ...HOST, isAbstract: true };
    const presetConfigs: InstanceListPresetConfigs = {
      fieldIds: ["hostname", "ip", "_deviceList_CLUSTER"],
    };
    const onInstanceSourceChange = jest.fn();

    const wrapper = mount(
      <InstanceList
        objectId={objectId}
        objectList={[modelData]}
        presetConfigs={presetConfigs}
        relationLinkDisabled={false}
        instanceSourceQuery={"HOST"}
        onInstanceSourceChange={onInstanceSourceChange}
      />
    );

    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(mockCmdbObjectApi_getIdMapName).toBeCalled();

    const fields: Record<string, boolean> = {};
    const newFieldIds = [
      "hostname",
      "ip",
      "_deviceList_CLUSTER",
      "_object_id",
      "instanceId",
    ];
    newFieldIds.forEach((id) => (fields[id] = true));

    expect(InstanceApi_postSearchV3).lastCalledWith(
      "HOST",
      expect.objectContaining({
        fields: newFieldIds,
        query: { _object_id: "HOST" },
      })
    );

    const instanceListTableProps: InstanceListTableProps =
      mockInstanceListTable.mock.calls[
        mockInstanceListTable.mock.calls.length - 1
      ][0];
    instanceListTableProps.onInstanceSourceChange("APP");
    expect(onInstanceSourceChange).lastCalledWith("APP");
  });

  it("should toggle advanced search when click advanced-search-toggle-btn", async () => {
    const aq = [
      {
        $and: [
          {
            ip: {
              $like: "%192.168.100.162%",
            },
          },
        ],
      },
    ];
    const { findByText, queryByText, queryByTestId } = render(
      <InstanceList objectId="HOST" objectList={[HOST]} aq={aq as Query[]} />
    );

    await act(async () => {
      await (global as any).flushPromises();
    });
    findByText(mockInstanceListTableContent);

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

  it("should work with hideSearchConditions", async () => {
    const mockOnRelatedToMeChange = jest.fn();
    const wrapper = mount(
      <InstanceList
        objectId="HOST"
        objectList={[HOST]}
        relatedToMe={true}
        onRelatedToMeChange={mockOnRelatedToMeChange}
        relationLinkDisabled={true}
        hideSearchConditions={true}
      />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find("Tag").length).toBe(0);
  });

  it("should work with hideSearchConditions", async () => {
    const _HOST = {
      ...HOST,
      relation_list: [
        ...HOST.relation_list,
        {
          left_id: "HOST_A",
          left_object_id: "HOST",
          relation_id: "HOST_SELF",
          right_id: "HOST_B",
          right_object_id: "HOST",
        },
      ],
    };
    const wrapper = mount(
      <InstanceList
        objectId="HOST"
        objectList={[_HOST]}
        aq={[
          {
            $or: [
              {
                hostname: {
                  $like: "%bug%",
                },
              },
            ],
          },
          {
            ip: {
              $exists: true,
            },
          },
          {
            $or: [
              {
                cpu: {
                  $eq: "closed",
                },
              },
            ],
          },
          {
            "backupowner.name": {
              $exists: false,
            },
          },
        ]}
      />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find("Tag").length).toBe(4);
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
    const onlySearchByIp = true;
    testdata.forEach((t) => {
      expect(getQuery(HOST, { HOST: HOST }, t.q, t.fields)).toEqual(t.expected);
      expect(
        getQuery(HOST, { HOST: HOST }, t.q, t.fields, onlySearchByIp)
      ).toEqual({ $or: [{ ip: { $like: "%aaa%" } }] });
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
    const extraFilterBricks = { useBrick: { brick: "span" } };
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
  it("check initAq should pass", async () => {
    const testdata: Record<string, any>[] = [
      {
        aq: [
          {
            $or: [{ ip: { $like: "%aaa%" } }],
          },
          {
            $or: [
              {
                _agentStatus: {
                  $eq: "未安装",
                },
              },
              {
                _agentStatus: {
                  $eq: "异常",
                },
              },
            ],
          },
        ],
        expected: [
          {
            $or: [{ ip: { $like: "%aaa%" } }],
          },
          {
            $or: [
              {
                _agentStatus: {
                  $eq: "未安装",
                },
              },
              {
                _agentStatus: {
                  $eq: "异常",
                },
              },
            ],
          },
        ],
      },
      {
        aq: [
          {
            $or: [
              {
                "cpu.brand": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                "cpu.architecture": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                "cpu.hz": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                logical_cores: {
                  $like: "%192.168.100.162%",
                },
              },
              {
                physical_cores: {
                  $like: "%192.168.100.162%",
                },
              },
            ],
          },
        ],
        expected: [{ $or: [{ cpu: { $like: "%192.168.100.162%" } }] }],
      },
      {
        aq: [
          {
            $and: [
              {
                ip: {
                  $like: "%192.168.100.162%",
                },
              },
            ],
          },
          {
            hostname: {
              $exist: false,
            },
          },
        ],
        expected: [
          { $and: [{ ip: { $like: "%192.168.100.162%" } }] },
          {
            hostname: {
              $exist: false,
            },
          },
        ],
      },
    ];
    testdata.forEach((t) => {
      expect(initAqToShow(t.aq, HOST, true)).toEqual(t.expected);
    });
    const testdata2: Record<string, any>[] = [
      {
        aq: [
          {
            $or: [
              {
                "cpu.brand": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                "cpu.architecture": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                "cpu.hz": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                logical_cores: {
                  $like: "%192.168.100.162%",
                },
              },
              {
                physical_cores: {
                  $like: "%192.168.100.162%",
                },
              },
            ],
          },
        ],
        expected: [
          {
            $or: [
              {
                "cpu.brand": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                "cpu.architecture": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                "cpu.hz": {
                  $like: "%192.168.100.162%",
                },
              },
              {
                logical_cores: {
                  $like: "%192.168.100.162%",
                },
              },
              {
                physical_cores: {
                  $like: "%192.168.100.162%",
                },
              },
            ],
          },
        ],
      },
      {
        aq: [
          {
            $and: [
              {
                bool: {
                  $eq: "true",
                },
              },
            ],
          },
        ],
        expected: [{ $and: [{ bool: { $eq: true } }] }],
      },
    ];
    testdata2.forEach((t) => {
      expect(initAqToShow(t.aq, HOST, false)).toEqual(t.expected);
    });
  });

  it("show work and dataSource", async () => {
    const { findByText } = render(
      <InstanceList
        objectId="HOST"
        objectList={[HOST]}
        asc={false}
        searchDisabled={true}
        relatedToMeDisabled={true}
        advancedSearchDisabled={true}
        notifyCurrentFields={jest.fn()}
        enableSearchByApp={true}
        moreButtonsDisabled={true}
        showHiddenInfoDisabled
        dataSource={{
          list: [
            {
              instanceId: "58650c75662fc",
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        }}
      />
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    findByText(mockInstanceListTableContent);
    const instanceListTableProps: InstanceListTableProps =
      mockInstanceListTable.mock.calls[
        mockInstanceListTable.mock.calls.length - 1
      ][0];
    expect(instanceListTableProps.instanceListData).toMatchObject({
      list: [
        {
          instanceId: "58650c75662fc",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it("disabledDefaultFields should be work", async () => {
    const wrapper = mount(
      <InstanceList
        objectId="HOST"
        objectList={[Object.assign(HOST, { attrList: [] })]}
        disabledDefaultFields
        relatedToMe={true}
      />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    expect(
      mockInstanceListTable.mock.calls[
        mockInstanceListTable.mock.calls.length - 1
      ][0].modelData.attrList.length
    ).toBe(0);
  });

  it("instanceListTable should be hidden", async () => {
    expect(InstanceApi_postSearchV3).toBeCalledTimes(13);
    const wrapper = mount(
      <InstanceList objectId="HOST" objectList={[HOST]} hideInstanceList />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find(InstanceListTable)).toEqual({});
    expect(InstanceApi_postSearchV3).toBeCalledTimes(13);
  });

  it("should work with enableSearchByApp", async () => {
    const mockOnRelatedToMeChange = jest.fn();
    const wrapper = mount(
      <InstanceList
        objectId="HOST"
        objectList={[HOST]}
        relatedToMe={true}
        onRelatedToMeChange={mockOnRelatedToMeChange}
        relationLinkDisabled={true}
        hideSearchConditions={true}
        enableSearchByApp={true}
      />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    wrapper.find(Button).at(0).simulate("click");
    wrapper.find(Button).at(2).simulate("click");
    // state not update when testing
    expect(wrapper.find(Select).length).toBe(0);
  });
});
