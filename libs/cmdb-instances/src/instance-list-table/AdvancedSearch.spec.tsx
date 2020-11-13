import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { CmdbModels } from "@sdk/cmdb-sdk";

import { AdvancedSearch } from "./AdvancedSearch";
import { HOST } from "./data-providers/__mocks__/fetchCmdbObjectDetail";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";

const mockOnSearch = jest.fn((query) => null);

afterEach(() => {
  cleanup();
  mockOnSearch.mockClear();
});

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
        onSearch={mockOnSearch}
      />
    );
    const input = getByLabelText(attr.name);
    const submitButton = getByTestId("submit-button");
    fireEvent.click(submitButton);
    expect(mockOnSearch).not.toBeCalled();
    fireEvent.change(input, { target: { value } });
    fireEvent.click(submitButton);
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
      />
    );
    const input = getByLabelText(attr.name);
    const submitButton = getByTestId("submit-button");
    const resetButton = getByTestId("reset-button");
    fireEvent.change(input, { target: { value } });
    fireEvent.click(resetButton);
    fireEvent.click(submitButton);
    expect(mockOnSearch).toBeCalledWith([], [], []);
  });
});
