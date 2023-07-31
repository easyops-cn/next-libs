import React from "react";
import { render, fireEvent } from "@testing-library/react";

import i18n from "i18next";
import FilterInstanceSource from "./FilterInstanceSource";
import * as storage from "@next-libs/storage";

jest.mock("../i18n");
jest.spyOn(i18n, "t").mockReturnValue("");
jest.mock("@next-libs/storage");

describe("FilterInstanceSource", () => {
  beforeAll(() => {
    (storage.JsonStorage as jest.Mock).mockImplementationOnce(() => ({
      getItem: jest.fn(() => ({
        HOST: "主机",
      })),
    }));
  });
  it("FilterInstanceSource should work", () => {
    const jsonLocalStorage = new storage.JsonStorage(localStorage);
    const onIconClicKChange = jest.fn();
    const onPopoverVisibleChange = jest.fn();
    const onChange = jest.fn();
    const { findByText, getByTestId, getAllByRole, getByRole } = render(
      <FilterInstanceSource
        checked={true}
        visible={true}
        onChange={onChange}
        inheritanceModelIdNameMap={{ HOST: "主机", APP: "应用" }}
        jsonLocalStorage={jsonLocalStorage}
        onIconClicKChange={onIconClicKChange}
        onPopoverVisibleChange={onPopoverVisibleChange}
      />
    );
    const input = getByTestId("instance-source-search");

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      charCode: 13,
      target: { value: "主机" },
    });

    expect(getAllByRole("radio").length).toBe(1);

    const Buttons = getAllByRole("button");
    expect(Buttons.length).toBe(2);
    fireEvent.click(Buttons[0]);
    expect(onIconClicKChange).toHaveBeenCalledTimes(1);
    fireEvent.click(Buttons[1]);
    expect(onPopoverVisibleChange).toHaveBeenCalledTimes(2);

    const IconButton = getByRole("img", { name: "filter" });
    fireEvent.click(IconButton, true);

    expect(onIconClicKChange).toHaveBeenCalledTimes(2);
    expect(onPopoverVisibleChange).toHaveBeenCalledTimes(3);

    expect(findByText("主机")).toBeTruthy();
  });
  it("FilterInstanceSource should work with isAbstract is true", () => {
    const jsonLocalStorage = new storage.JsonStorage(localStorage);
    const onIconClicKChange = jest.fn();
    const onPopoverVisibleChange = jest.fn();
    const onChange = jest.fn();
    const { findByText, getByTestId, getAllByRole, getByRole } = render(
      <FilterInstanceSource
        checked={true}
        visible={true}
        onChange={onChange}
        inheritanceModelIdNameMap={{ HOST: "主机", APP: "应用" }}
        jsonLocalStorage={jsonLocalStorage}
        onIconClicKChange={onIconClicKChange}
        onPopoverVisibleChange={onPopoverVisibleChange}
        isAbstract={true}
      />
    );
    const input = getByTestId("instance-source-search");

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      charCode: 13,
      target: { value: "主机" },
    });

    expect(getAllByRole("radio").length).toBe(1);
    const Buttons = getAllByRole("button");
    expect(Buttons.length).toBe(2);
    fireEvent.click(Buttons[0]);
    expect(onIconClicKChange).toBeCalledTimes(0);

    fireEvent.click(Buttons[1]);
    expect(onPopoverVisibleChange).toHaveBeenCalledTimes(1);

    const IconButton = getByRole("img", { name: "filter" });
    fireEvent.click(IconButton, true);

    expect(onIconClicKChange).toHaveBeenCalledTimes(1);
    expect(onPopoverVisibleChange).toHaveBeenCalledTimes(2);

    expect(findByText("主机")).toBeTruthy();
  });
});
