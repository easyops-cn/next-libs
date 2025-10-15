import React from "react";
import { shallow } from "enzyme";
import { DisplaySettings } from "./DisplaySettings";
import { HOST } from "./data-providers/__mocks__";
import { Checkbox, Input } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
describe("DisplaySettings", () => {
  const objectId = "HOST";
  const modelData = HOST;
  const extraDisabledField = "hostname";

  it("should work", async () => {
    const handleChange = jest.fn();
    const currentFields = modelData.attrList.map((attr) => attr.id);
    const wrapper = shallow(
      <DisplaySettings
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

    const getSelectAllCheckbox = () =>
      wrapper.find(Checkbox).filter(`[data-testid='checkbox-select-all']`);

    getSelectAllCheckbox().invoke("onChange")({
      target: { checked: true },
    } as unknown as CheckboxChangeEvent);
    expect(getSelectAllCheckbox().prop("checked")).toBe(true);
    expect(
      wrapper
        .find(Checkbox)
        .filter(`[data-testid$='-checkbox']`)
        .map((v) => v.prop("checked"))
        .filter((v) => v === true)
    ).toHaveLength(22);

    const checkbox1 = getCheckbox("_agentStatus");
    expect(checkbox1.prop("checked")).toBe(true);
    checkbox1.invoke("onChange")({
      target: { checked: false },
    } as unknown as CheckboxChangeEvent);
    expect(getCheckbox("_agentStatus").prop("checked")).toBe(false);
    await (global as any).flushPromises();
    expect(getSelectAllCheckbox().prop("checked")).toBe(true);
    expect(
      wrapper
        .find(Checkbox)
        .filter(`[data-testid$='-checkbox']`)
        .map((v) => v.prop("checked"))
        .filter((v) => v === true)
    ).toHaveLength(21);
    checkbox1.invoke("onChange")({
      target: { checked: true },
    } as unknown as CheckboxChangeEvent);
    expect(getSelectAllCheckbox().prop("checked")).toBe(false);

    // search
    expect(getCheckbox("_agentStatus")).toHaveLength(1);
    expect(getCheckbox("hostname")).toHaveLength(1);

    getSelectAllCheckbox().invoke("onChange")({
      target: { checked: false },
    } as unknown as CheckboxChangeEvent);
    expect(
      wrapper
        .find(Checkbox)
        .filter(`[data-testid$='-checkbox']`)
        .map((v) => v.prop("checked"))
        .filter((v) => v === true)
    ).toHaveLength(0);

    wrapper
      .find(Input.Search)
      .filter("[data-testid='search-input']")
      .invoke("onChange")({
      target: { value: "agent" },
    } as React.ChangeEvent<HTMLInputElement>);
    jest.runAllTimers();
    expect(getCheckbox("_agentStatus")).toHaveLength(1);
    expect(getCheckbox("hostname")).toHaveLength(0);

    wrapper
      .find(Input.Search)
      .filter("[data-testid='search-input']")
      .invoke("onChange")({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
    jest.runAllTimers();
    wrapper.find(".fieldTypeTag").at(0).simulate("click");
    jest.runAllTimers();
    expect(
      wrapper.find(Checkbox).filter(`[data-testid$='-checkbox']`)
    ).toHaveLength(20);

    wrapper.find(".fieldTypeTag").at(0).simulate("click");
    jest.runAllTimers();
    expect(
      wrapper.find(Checkbox).filter(`[data-testid$='-checkbox']`)
    ).toHaveLength(22);
  });
});
