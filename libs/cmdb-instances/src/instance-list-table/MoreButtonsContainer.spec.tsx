import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MoreButtonsContainer } from "./MoreButtonsContainer";
import { HOST } from "./data-providers/__mocks__";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";

jest.mock("./DisplaySettings", () => ({
  DisplaySettings: jest.fn((props: any) => {
    return <div>DisplaySettings Fake loaded!</div>;
  }),
}));

describe("MoreButtonsContainer", () => {
  const modelData = HOST;
  const handleConfirm = jest.fn();

  it("handleSettingButtonClick should work", () => {
    const { getByRole, getByText, queryByText } = render(
      <MoreButtonsContainer
        modelData={modelData}
        onConfirm={handleConfirm}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        defaultFields={[]}
      />
    );
    const moreSettingsButton = getByRole("button");
    fireEvent.click(moreSettingsButton);
    const settingText = i18n.t(
      `${NS_LIBS_CMDB_INSTANCES}:${K.DISPLAY_SETTINGS}`
    );
    const settingButton = getByText(settingText);
    fireEvent.click(settingButton);
  });
});
