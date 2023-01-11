import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import {
  AdvancedSearchCondition,
  formatAqToShow,
} from "./AdvancedSearchCondition";
import { DynamicSearch, DynamicSearchFormProps } from "./DynamicSearch";
import { mount } from "enzyme";

jest.mock("./DynamicSearch", () => ({
  DynamicSearch: jest.fn(() => {
    return "<div>Fake dynamic search loaded!</div>";
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

const Fields: Record<string, any>[] = [
  {
    id: "clusterInstance.deployHost.hostname",
    name: "集群主机名",
  },
  {
    id: "hostname",
    name: "主机名2",
  },
  {
    id: "ARTIFACT_INSTANCE_HISTORY.HOST.hostname",
    name: "HostName",
  },
];

const mockDynamicSearch = DynamicSearch as any as jest.Mock;
const mockDynamicSearchContent = mockDynamicSearch();

afterEach(cleanup);

describe("AdvancedSearchCondition", () => {
  it("should call searchCmdbInstances show search conditions", async () => {
    const onAdvancedSearch = jest.fn();
    const { findByText, queryByText } = render(
      <AdvancedSearchCondition
        fields={Fields}
        onAdvancedSearch={onAdvancedSearch}
      />
    );

    await act(async () => {
      await (global as any).flushPromises();
    });
    findByText(mockDynamicSearchContent);

    expect(mockDynamicSearch).toBeCalled();
    const dynamicSearchFormProps: DynamicSearchFormProps =
      mockDynamicSearch.mock.calls[mockDynamicSearch.mock.calls.length - 1][0];
    expect(dynamicSearchFormProps.fields).toEqual(Fields);
    const mockAdvancedSearchElement = queryByText(mockDynamicSearchContent);
    expect(mockAdvancedSearchElement).toBeVisible();
  });

  it("check initAq should pass", async () => {
    const testdata: Record<string, any>[] = [
      {
        aq: [
          {
            $or: [{ hostname: { $like: "%aaa%" } }],
          },
        ],
        expected: [
          {
            $or: [{ hostname: { $like: "%aaa%" } }],
          },
        ],
      },
      {
        aq: [
          {
            $or: [
              {
                "ARTIFACT_INSTANCE_HISTORY.HOST.hostname": {
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
                "ARTIFACT_INSTANCE_HISTORY.HOST.hostname": {
                  $like: "%192.168.100.162%",
                },
              },
            ],
          },
        ],
      },
    ];
    testdata.forEach((t) => {
      expect(formatAqToShow(t.aq)).toEqual(t.expected);
    });
  });

  it("should work with hideSearchConditions", async () => {
    const wrapper = mount(
      <AdvancedSearchCondition fields={Fields} hideSearchConditions={true} />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find("Tag").length).toBe(0);
  });

  it("should work with hideSearchConditions", async () => {
    const wrapper = mount(
      <AdvancedSearchCondition
        fields={Fields}
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
        ]}
      />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find("Tag").length).toBe(1);
  });
  it("should work with hideDynamicSearch", async () => {
    const wrapper = mount(
      <AdvancedSearchCondition fields={Fields} hideDynamicSearch={true} />
    );
    await (global as any).flushPromises();
    await jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find(DynamicSearch).length).toBe(0);
  });
});
