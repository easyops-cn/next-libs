import React from "react";
import { shallow } from "enzyme";
import { LocationDescriptorObject } from "history";
import { createHistory } from "@next-core/brick-kit";
import { PluginHistoryState } from "@next-core/brick-types";
import { Link } from "./Link";

createHistory();

describe("Link", () => {
  it("render simple link", () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Link to="/for-simple" onClick={onClick} />);
    expect(wrapper.find("a").prop("href")).toBe("/for-simple");
    expect(wrapper.find("a").prop("style")).toEqual({});

    wrapper.find("a").simulate("click", {});
    expect(onClick).toBeCalledTimes(1);
  });

  it("render complex link", () => {
    const to: LocationDescriptorObject<PluginHistoryState> = {
      pathname: "for-complex",
      search: "?even-more",
      hash: "#and-more",
    };
    const wrapper = shallow(<Link to={to} />);
    expect(wrapper.find("a").prop("href")).toBe(
      "for-complex?even-more#and-more"
    );
  });

  it("should render with new href property", () => {
    const wrapper = shallow(<Link href="http://192.168.100.163" />);
    expect(wrapper.find("a").prop("href")).toBe("http://192.168.100.163");
  });

  it("should render with no empty href", () => {
    const wrapper = shallow(<Link noEmptyHref />);
    expect(wrapper.find("a").prop("href")).toBe(undefined);
  });

  it("should render with disabled link", () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <Link
        to="/for-disabled"
        disabled
        onClick={onClick}
        style={{ color: "red" }}
      />
    );
    expect(wrapper.find("a").props()).toEqual(
      expect.objectContaining({
        href: undefined,
        style: {
          cursor: "not-allowed",
          color: "red",
        },
      })
    );

    const preventDefault = jest.fn();
    wrapper.find("a").simulate("click", {
      preventDefault,
    });
    expect(onClick).not.toBeCalled();
    expect(preventDefault).toBeCalled();
  });
});
