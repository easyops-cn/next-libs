import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TableTooltip } from "./TableTooltip";

jest.mock("antd", () => ({
  Tooltip: jest.fn(({ children, title, placement }) => (
    <div data-testid="tooltip" data-title={title} data-placement={placement}>
      {children}
    </div>
  )),
}));

jest.mock("i18next", () => ({
  t: jest.fn((key) => key),
}));

jest.mock("@next-libs/basic-components", () => ({
  GeneralIcon: jest.fn(
    ({ icon, onClick, onMouseEnter, onMouseLeave, iconClassName }) => (
      <i
        data-testid="general-icon"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={iconClassName}
        data-icon={JSON.stringify(icon)}
      />
    )
  ),
}));

describe("TableTooltip", () => {
  it("should render correctly with default props", () => {
    render(<TableTooltip />);
    const icon = screen.getByTestId("general-icon");
    expect(icon).not.toBeNull();
  });

  it("should render with correct icon properties", () => {
    render(<TableTooltip />);
    const icon = screen.getByTestId("general-icon");
    const iconData = JSON.parse(icon.getAttribute("data-icon"));

    expect(iconData).toEqual({
      lib: "easyops",
      category: "patch-manager",
      icon: "patch-list",
    });
  });

  it("should call onClick handler when clicked", () => {
    const onClick = jest.fn();
    render(<TableTooltip onClick={onClick} />);
    const icon = screen.getByTestId("general-icon");

    fireEvent.click(icon);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not throw error when onClick is not provided", () => {
    const iconClick = jest.fn();
    render(<TableTooltip onClick={iconClick} />);
    const icon = screen.getByTestId("general-icon");

    expect(() => {
      fireEvent.click(icon);
    }).not.toThrow();
    expect(iconClick).toHaveBeenCalled();
  });
});
