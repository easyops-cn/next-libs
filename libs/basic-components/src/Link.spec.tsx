import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { createHistory, getHistory } from "@next-core/brick-kit";
import { LocationDescriptorObject } from "history";
import { Link } from "./Link";
import { PluginHistoryState } from "@next-core/brick-types";
import { act } from "react-dom/test-utils";

createHistory();

beforeEach(() => {
  getHistory().push("/home");
});

test("render simple link", () => {
  const preventDefault = jest.fn();
  render(<Link to="/for-simple">xxx</Link>);
  expect(screen.getByText("xxx")).toBeTruthy();
  fireEvent.click(screen.getByText("xxx"), {
    preventDefault,
    button: 0,
  });
  expect(getHistory().location).toMatchObject({
    pathname: "/for-simple",
    search: "",
  });
});

test("render complex lin", () => {
  const to: LocationDescriptorObject<PluginHistoryState> = {
    pathname: "for-complex",
    search: "?even-more",
    hash: "#and-more",
  };
  render(<Link to={to}>xxx</Link>);
  expect(screen.getByText("xxx").getAttribute("href")).toBe(
    "for-complex?even-more#and-more"
  );
});

test("should render with new href property", () => {
  render(<Link href="http://192.168.100.163">xxx</Link>);
  expect(screen.getByText("xxx").getAttribute("href")).toBe(
    "http://192.168.100.163"
  );
});

test("should render with no empty href", () => {
  render(<Link noEmptyHref>xxx</Link>);
  expect(screen.getByText("xxx").getAttribute("href")).toBe(null);
});

test("should render with disabled link", () => {
  const onClick = jest.fn();
  render(
    <Link
      to="/for-disabled"
      disabled
      onClick={onClick}
      style={{ color: "red" }}
    >
      xxx
    </Link>
  );
  fireEvent.click(screen.getByText("xxx"), {
    button: 0,
  });
  expect(getHistory().location).toMatchObject({
    pathname: "/home",
    search: "",
  });
});

test("should render with no empty href", () => {
  render(
    <Link
      to={{
        pathname: "/abc",
        keepCurrentSearch: true,
      }}
    >
      xxx
    </Link>
  );
  expect(screen.getByText("xxx")).toBeTruthy();
});
