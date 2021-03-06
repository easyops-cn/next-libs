import "@testing-library/jest-dom/extend-expect";
import React from "react";
import {
  render,
  fireEvent,
  waitForElement,
  wait,
} from "@testing-library/react";
import { Settings } from "./SettingsContainer";
import { HOST } from "./data-providers/__mocks__";
import { InstanceListPresetConfigs } from "./interfaces";
import { getBatchEditableRelations } from "@next-libs/cmdb-utils";

describe("Settings", () => {
  const objectId = "HOST";
  const modelData = HOST;
  const onHandleConfirm = jest.fn();
  const onHandleReset = jest.fn();
  const onHideSetting = jest.fn();
  const presetConfigs: InstanceListPresetConfigs = { fieldIds: [] };

  it("handleConfirm should work", () => {
    const { getByText } = render(
      <Settings
        objectId={objectId}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        modelData={modelData}
        onHandleConfirm={onHandleConfirm}
        onHandleReset={onHandleReset}
        onHideSettings={onHideSetting}
      />
    );
    fireEvent.click(getByText("确 定"));
    expect(onHideSetting).toBeCalled();
    expect(onHandleConfirm).toBeCalledWith(
      modelData.attrList.map((attr) => attr.id)
    );
  });

  it("handleCancel should work", () => {
    const { getByText } = render(
      <Settings
        objectId={objectId}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        modelData={modelData}
        onHandleConfirm={onHandleConfirm}
        onHandleReset={onHandleReset}
        onHideSettings={onHideSetting}
      />
    );
    fireEvent.click(getByText("取 消"));
    expect(onHideSetting).toBeCalled();
  });

  it("handleReset should work", () => {
    const { getByText } = render(
      <Settings
        objectId={objectId}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        modelData={modelData}
        onHandleConfirm={onHandleConfirm}
        onHandleReset={onHandleReset}
        onHideSettings={onHideSetting}
        defaultFields={presetConfigs.fieldIds}
      />
    );
    fireEvent.click(getByText("恢复默认"));
    expect(onHideSetting).toBeCalled();
    expect(onHandleReset).toBeCalledWith(presetConfigs.fieldIds);
  });

  it("handleChecked should work", async () => {
    const { getByText, getAllByText } = render(
      <Settings
        objectId={objectId}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        modelData={modelData}
        onHandleConfirm={onHandleConfirm}
        onHandleReset={onHandleReset}
        onHideSettings={onHideSetting}
        defaultFields={presetConfigs.fieldIds}
      />
    );
    const agentStatus = getAllByText("agent状态")[0];
    const agentStatusCheckbox = agentStatus.parentElement.querySelector(
      "input"
    );
    expect(agentStatusCheckbox.checked).toBe(true);
    fireEvent.click(agentStatus);
    expect(agentStatusCheckbox.checked).toBe(false);
  });

  it("handleChange should work", async () => {
    const { getByPlaceholderText, container } = render(
      <Settings
        objectId={objectId}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        modelData={modelData}
        onHandleConfirm={onHandleConfirm}
        onHandleReset={onHandleReset}
        onHideSettings={onHideSetting}
        defaultFields={presetConfigs.fieldIds}
      />
    );
    const inputSearch = getByPlaceholderText(
      "按字段名称搜索"
    ) as HTMLInputElement;
    fireEvent.change(inputSearch, { target: { value: "agent" } });
    // todo 没有触发 filterColTag
    // expect(container.querySelectorAll(".nextFields input").length).toBe(3);
  });
});
