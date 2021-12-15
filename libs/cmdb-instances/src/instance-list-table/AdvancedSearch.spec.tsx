import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { AdvancedSearch, getFieldConditionsAndValues } from "./AdvancedSearch";
import { HOST } from "./data-providers/__mocks__/fetchCmdbObjectDetail";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
const mockOnSearch = jest.fn((query) => null);
const mockAutoSearch = jest.fn();

afterEach(() => {
  cleanup();
  mockOnSearch.mockClear();
});
jest.mock("../i18n");

describe("AdvancedSearch", () => {
  it("should init fields with given q", () => {
    let intAttr: Partial<CmdbModels.ModelObjectAttr>;
    let strAttr: Partial<CmdbModels.ModelObjectAttr>;
    let arrAttr: Partial<CmdbModels.ModelObjectAttr>;
    HOST.attrList.some((attr) => {
      switch (attr.value.type) {
        case ModelAttributeValueType.INTEGER:
          if (!intAttr) {
            intAttr = attr;
          }
          break;
        case ModelAttributeValueType.STRING:
          if (!strAttr) {
            strAttr = attr;
          }
          break;
        case ModelAttributeValueType.ARR:
          if (!arrAttr) {
            arrAttr = attr;
          }
          break;
      }
      return intAttr && strAttr && arrAttr;
    });
    const intValue = 111;
    const strValue = "aaa";
    const arrValue = ["bbb", "ccc"];
    const { getByLabelText } = render(
      <AdvancedSearch
        idObjectMap={{ HOST }}
        modelData={HOST}
        q={[
          { [intAttr.id]: { $eq: intValue } },
          { [strAttr.id]: { $like: `%${strValue}%` } },
          { [arrAttr.id]: { $in: arrValue } },
        ]}
        onSearch={mockOnSearch}
        fieldToShow={[{ [strAttr.id]: [`"${strValue}"`] }]}
      />
    );
    const input = getByLabelText(intAttr.name);
    expect((input as HTMLInputElement).value).toBe(String(intValue));
  });

  it("should call onSearch after click submit button", () => {
    const attr = HOST.attrList.find(
      (attr) => attr.value.type === ModelAttributeValueType.STRING
    );
    const value = "aaa";
    const { getByLabelText, getByTestId } = render(
      <AdvancedSearch
        idObjectMap={{ HOST }}
        modelData={HOST}
        autoSearch={mockAutoSearch}
        onSearch={mockOnSearch}
      />
    );
    const input = getByLabelText(attr.name);
    const submitButton = getByTestId("submit-button");
    fireEvent.click(submitButton);
    expect(mockOnSearch).not.toBeCalled();
    fireEvent.change(input, { target: { value } });
    fireEvent.click(submitButton);
    expect(mockAutoSearch).toBeCalledTimes(2);
    expect(mockOnSearch).toBeCalledWith(
      [{ $or: [{ [attr.id]: { $like: `%${value}%` } }] }],
      [{ $or: [{ [attr.id]: { $like: `%${value}%` } }] }],
      [{ [attr.id]: [`${value}`] }]
    );
  });

  it("should reset fields after click reset button", () => {
    const attr = HOST.attrList.find(
      (attr) => attr.value.type === ModelAttributeValueType.INTEGER
    );
    const value = 111;
    const { getByLabelText, getByTestId } = render(
      <AdvancedSearch
        idObjectMap={{ HOST }}
        modelData={HOST}
        onSearch={mockOnSearch}
        autoSearch={mockAutoSearch}
      />
    );
    const input = getByLabelText(attr.name);
    const submitButton = getByTestId("submit-button");
    const resetButton = getByTestId("reset-button");
    fireEvent.change(input, { target: { value } });
    fireEvent.click(resetButton);
    fireEvent.click(submitButton);
    expect(mockOnSearch).toBeCalledWith([], [], []);
    expect(mockAutoSearch).toBeCalledTimes(4);
  });
  it("getFieldConditionsAndValues as pass", () => {
    expect(
      getFieldConditionsAndValues(
        { ip: { $like: "%aaa%" } },
        "ip",
        "str" as ModelAttributeValueType,
        false
      )
    ).toEqual({
      availableConditions: [
        {
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_CONTAIN_DEFINE}`
          ),
          operations: [
            {
              operator: "$like",
              prefix: "%",
              suffix: "%",
            },
          ],
          type: "contain",
        },
        {
          label: `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_NOT_CONTAIN_DEFINE}`,
          operations: [
            {
              operator: "$nlike",
              prefix: "%",
              suffix: "%",
            },
          ],
          type: "notContain",
        },
        {
          label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_EQUAL_DEFINE}`),
          operations: [
            {
              operator: "$eq",
            },
          ],
          type: "equal",
        },
        {
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_NOT_EQUAL_DEFINE}`
          ),
          operations: [
            {
              operator: "$ne",
            },
          ],
          type: "notEqual",
        },
        {
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_IS_EMPTY_DEFINE}`
          ),
          operations: [
            {
              fixedValue: false,
              operator: "$exists",
            },
          ],
          type: "empty",
        },
        {
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_IS_NOT_EMPTY_DEFINE}`
          ),
          operations: [
            {
              fixedValue: true,
              operator: "$exists",
            },
          ],
          type: "notEmpty",
        },
      ],
      currentCondition: {
        label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_CONTAIN_DEFINE}`),
        operations: [
          {
            operator: "$like",
            prefix: "%",
            suffix: "%",
          },
        ],
        type: "contain",
      },
      disabled: false,
      queryValuesStr: "%aaa%",
      values: ["aaa"],
    });
    expect(
      getFieldConditionsAndValues(
        {
          datetime: {
            $gte: "2021-04-06",
            $lte: "2021-04-27",
          },
        },
        "datetime",
        "datetime" as ModelAttributeValueType,
        false
      )
    ).toEqual({
      availableConditions: [
        {
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_BETWEEN_DEFINE_TEXT_TIME}`
          ),
          operations: [
            {
              operator: "$gte",
            },
            {
              operator: "$lte",
            },
          ],
          type: "between",
        },
        {
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_IS_EMPTY_DEFINE}`
          ),
          operations: [
            {
              fixedValue: false,
              operator: "$exists",
            },
          ],
          type: "empty",
        },
        {
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_IS_NOT_EMPTY_DEFINE}`
          ),
          operations: [
            {
              fixedValue: true,
              operator: "$exists",
            },
          ],
          type: "notEmpty",
        },
      ],
      currentCondition: {
        label: i18n.t(
          `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_BETWEEN_DEFINE_TEXT_TIME}`
        ),
        operations: [
          {
            operator: "$gte",
          },
          {
            operator: "$lte",
          },
        ],
        type: "between",
      },
      disabled: false,
      queryValuesStr: "2021-04-27",
      values: ["2021-04-06", "2021-04-27"],
    });
  });
});
