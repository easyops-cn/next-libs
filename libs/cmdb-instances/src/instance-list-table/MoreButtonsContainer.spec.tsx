import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MoreButtonsContainer } from "./MoreButtonsContainer";
import { HOST } from "./data-providers/__mocks__";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";

jest.mock("./SettingsContainer", () => ({
  Settings: jest.fn((props: any) => {
    return (
      <div>
        Settings Fake loaded!
        <button onClick={props.onHideSettings}>取 消</button>
      </div>
    );
  }),
}));

describe("MoreButtonsContainer", () => {
  const modelData = HOST;
  const onHandleConfirm = jest.fn();
  const onHandleReset = jest.fn();
  const onHideSettings = jest.fn();

  it("handleSettingButtonClick should work", () => {
    const { getByRole, getByText, queryByText } = render(
      <MoreButtonsContainer
        modelData={modelData}
        onHandleConfirm={onHandleConfirm}
        onHandleReset={onHandleReset}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        onHideSettings={onHideSettings}
        defaultFields={[]}
      />
    );
    const moreSettingsButton = getByRole("button");
    fireEvent.click(moreSettingsButton);
    const settingText = i18n.t(
      `${NS_LIBS_CMDB_INSTANCES}:${K.COLUMNS_TO_DISPLAY}`
    );
    const settingButton = getByText(settingText);
    fireEvent.click(settingButton);
    const cancelBtn = getByText("取 消");
    fireEvent.click(cancelBtn);
    expect(queryByText("确 定")).toBe(null);
  });
});
