import React from "react";
import { shallow } from "enzyme";
import { Settings } from "./SettingsContainer";
import { HOST } from "./data-providers/__mocks__";
import { Checkbox, Input } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
describe("Settings", () => {
  const objectId = "HOST";
  const modelData = HOST;
  const extraDisabledField = "hostname";

  it("should work", async () => {
    const handleChange = jest.fn();
    const currentFields = modelData.attrList.map((attr) => attr.id);
    const wrapper = shallow(
      <Settings
        objectId={objectId}
        currentFields={currentFields}
        modelData={modelData}
        extraDisabledField={extraDisabledField}
        onChange={handleChange}
      />
    );

    // check
    const getCheckbox = (field: string) =>
      wrapper.find(Checkbox).filter(`[data-testid='${field}-checkbox']`);
    const checkbox = getCheckbox("_agentStatus");
    expect(checkbox.prop("checked")).toBe(true);
    checkbox.invoke("onChange")({
      target: { checked: false },
    } as unknown as CheckboxChangeEvent);
    expect(getCheckbox("_agentStatus").prop("checked")).toBe(false);
    expect(getCheckbox("hostname").props()).toEqual(
      expect.objectContaining({ checked: true, disabled: true })
    );
    expect(handleChange).toBeCalledWith(
      currentFields.filter((field) => field !== "_agentStatus")
    );

    // search
    expect(getCheckbox("_agentStatus")).toHaveLength(1);
    expect(getCheckbox("hostname")).toHaveLength(1);
    wrapper
      .find(Input.Search)
      .filter("[data-testid='search-input']")
      .invoke("onChange")({
      target: { value: "agent" },
    } as React.ChangeEvent<HTMLInputElement>);
    jest.runAllTimers();
    expect(getCheckbox("_agentStatus")).toHaveLength(1);
    expect(getCheckbox("hostname")).toHaveLength(0);
  });
});
