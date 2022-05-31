import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { DynamicSearch } from "./DynamicSearch";
const mockOnSearch = jest.fn((query) => null);

afterEach(() => {
  cleanup();
  mockOnSearch.mockClear();
});
jest.mock("../i18n");

const fields = [
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

describe("AdvancedSearch", () => {
  it("should init fields with given q", () => {
    const intValue = 0;

    const { getByLabelText } = render(
      <DynamicSearch
        fields={fields}
        q={[{ ["hostname"]: { $like: `%0%` } }]}
        onSearch={mockOnSearch}
        fieldToShow={[{ hostname: [`"${0}"`] }]}
      />
    );
    const input = getByLabelText("主机名2");
    expect((input as HTMLInputElement).value).toBe(String(intValue));
  });

  it("should call onSearch after click submit button", () => {
    const value = "aaa";
    const { getByLabelText, getByTestId } = render(
      <DynamicSearch fields={fields} onSearch={mockOnSearch} />
    );
    const input = getByLabelText("主机名2");
    const submitButton = getByTestId("submit-button");
    fireEvent.click(submitButton);
    expect(mockOnSearch).not.toBeCalled();
    fireEvent.change(input, { target: { value } });
    fireEvent.click(submitButton);
    expect(mockOnSearch).toBeCalledWith(
      [{ $or: [{ hostname: { $like: `%${value}%` } }] }],
      [{ $or: [{ hostname: { $like: `%${value}%` } }] }],
      [{ hostname: [`${value}`] }]
    );
  });

  it("should reset fields after click reset button", () => {
    const value = 111;
    const { getByLabelText, getByTestId } = render(
      <DynamicSearch fields={fields} onSearch={mockOnSearch} />
    );
    const input = getByLabelText("主机名2");
    const submitButton = getByTestId("submit-button");
    const resetButton = getByTestId("reset-button");
    fireEvent.change(input, { target: { value } });
    fireEvent.click(resetButton);
    fireEvent.click(submitButton);
    expect(mockOnSearch).toBeCalledWith([], [], []);
  });
});
