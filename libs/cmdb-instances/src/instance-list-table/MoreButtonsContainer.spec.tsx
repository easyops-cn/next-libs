import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MoreButtonsContainer } from "./MoreButtonsContainer";
import { InstanceListPresetConfigs } from "./interfaces";
import { HOST } from "./data-providers/__mocks__";

jest.mock("./SettingsContainer", () => ({
  Settings: jest.fn((props: any) => {
    return (
      <div>
        Settings Fake loaded!
        <button onClick={props.onHideSettings}>取 消</button>
      </div>
    );
  })
}));

describe("MoreButtonsContainer", () => {
  const modelData = HOST;
  const onHandleConfirm = jest.fn();
  const onHandleReset = jest.fn();
  const presetConfigs: InstanceListPresetConfigs = {};
  const currentFields = presetConfigs.fieldIds;
  const onHideSettings = jest.fn();

  it("handleSettingButtonClick should work", () => {
    const { getByRole, getByText, queryByText } = render(
      <MoreButtonsContainer
        modelData={modelData}
        onHandleConfirm={onHandleConfirm}
        onHandleReset={onHandleReset}
        presetConfigs={presetConfigs}
        currentFields={modelData.attrList.map(attr => attr.id)}
        onHideSettings={onHideSettings}
        defaultFields={[]}
      />
    );
    const moreSettingsButton = getByRole("button");
    fireEvent.click(moreSettingsButton);
    const settingButton = getByText("显示设置");
    fireEvent.click(settingButton);
    const cancelBtn = getByText("取 消");
    fireEvent.click(cancelBtn);
    expect(queryByText("确 定")).toBe(null);
  });
});
