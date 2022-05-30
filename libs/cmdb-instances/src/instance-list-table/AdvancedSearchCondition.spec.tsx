import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AdvancedSearchCondition } from "./AdvancedSearchCondition";
import { AdvancedSearch, AdvancedSearchFormProps } from "./AdvancedSearch";
import { mount } from "enzyme";

jest.mock("./AdvancedSearch", () => ({
  AdvancedSearch: jest.fn(() => {
    return "<div>Fake advanced search loaded!</div>";
  }),
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

const mockAdvancedSearch = AdvancedSearch as any as jest.Mock;
const mockAdvancedSearchContent = mockAdvancedSearch();

afterEach(cleanup);

describe("AdvancedSearchCondition", () => {
  it("should call searchCmdbInstances show search conditions", async () => {
    const objectId = "HOST";
    const modelData = HOST;
    const idObjectMap = { [objectId]: modelData };
    const onAdvancedSearch = jest.fn();
    const fieldIds: string[] = ["hostname", "ip", "_deviceList_CLUSTER"];

    const { findByText, queryByText } = render(
      <AdvancedSearchCondition
        objectId={objectId}
        objectList={[HOST]}
        onAdvancedSearch={onAdvancedSearch}
        fieldIds={fieldIds}
      />
    );

    await act(async () => {
      await (global as any).flushPromises();
    });
    findByText(mockAdvancedSearchContent);
    const fields: Record<string, boolean> = {};
    const newFieldIds = ["hostname", "ip", "_deviceList_CLUSTER"];
    newFieldIds.forEach((id) => (fields[id] = true));

    expect(mockAdvancedSearch).toBeCalled();
    const advancedSearchFormProps: AdvancedSearchFormProps =
      mockAdvancedSearch.mock.calls[
        mockAdvancedSearch.mock.calls.length - 1
      ][0];
    expect(advancedSearchFormProps.idObjectMap).toEqual(idObjectMap);
    expect(advancedSearchFormProps.modelData).toBe(modelData);
    expect(advancedSearchFormProps.fieldIds).toEqual(newFieldIds);
    const mockAdvancedSearchElement = queryByText(mockAdvancedSearchContent);
    expect(mockAdvancedSearchElement).toBeVisible();
  });

  it("should work when model's isAbstract is true", async () => {
    const objectId = "HOST";
    const modelData = { ...HOST, isAbstract: true };
    const fieldIds: string[] = ["hostname", "ip", "_deviceList_CLUSTER"];

    const wrapper = mount(
      <AdvancedSearchCondition
        objectId={objectId}
        objectList={[modelData]}
        fieldIds={fieldIds}
      />
    );

    await act(async () => {
      await (global as any).flushPromises();
    });

    const fields: Record<string, boolean> = {};
    const newFieldIds = ["hostname", "ip", "_deviceList_CLUSTER", "_object_id"];
    newFieldIds.forEach((id) => (fields[id] = true));

    const advancedSearchFormProps: AdvancedSearchFormProps =
      mockAdvancedSearch.mock.calls[
        mockAdvancedSearch.mock.calls.length - 1
      ][0];
    expect(advancedSearchFormProps.fieldIds.length).toBe(4);
    expect(advancedSearchFormProps.fieldIds).toEqual(newFieldIds);
  });

  it("should work when fieldIds is empty array", async () => {
    const objectId = "HOST";
    const onAdvancedSearch = jest.fn();
    const { findByText } = render(
      <AdvancedSearchCondition
        objectId={objectId}
        objectList={[HOST]}
        onAdvancedSearch={onAdvancedSearch}
      />
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    findByText(mockAdvancedSearchContent);
    const fields: Record<string, boolean> = {};
    const newFieldIds = [
      "ip",
      "cpu",
      "__pipeline",
      "hostname",
      "testSort",
      "bool",
    ];
    expect(mockAdvancedSearch).toBeCalled();
    const advancedSearchFormProps: AdvancedSearchFormProps =
      mockAdvancedSearch.mock.calls[
        mockAdvancedSearch.mock.calls.length - 1
      ][0];
    newFieldIds.forEach((id) => (fields[id] = true));
    expect(advancedSearchFormProps.fieldIds).toEqual(newFieldIds);
  });

  it("should work with hideSearchConditions", async () => {
    const wrapper = mount(
      <AdvancedSearchCondition
        objectId="HOST"
        objectList={[HOST]}
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
      <AdvancedSearchCondition
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
});
