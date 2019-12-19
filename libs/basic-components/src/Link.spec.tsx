import React from "react";
import { shallow } from "enzyme";
import { LocationDescriptorObject } from "history";
import { createHistory } from "@easyops/brick-kit";
import { PluginHistoryState } from "@easyops/brick-types";
import { Link } from "./Link";

createHistory();

describe("Link", () => {
  it("render simple link", () => {
    const wrapper = shallow(<Link to="/for-simple" />);
    expect(wrapper).toMatchInlineSnapshot(`
      <a
        href="/for-simple"
        onClick={[Function]}
      />
    `);
  });

  it("render complex link", () => {
    const to: LocationDescriptorObject<PluginHistoryState> = {
      pathname: "for-complex",
      search: "?even-more",
      hash: "#and-more"
    };
    const wrapper = shallow(<Link to={to} />);
    expect(wrapper).toMatchInlineSnapshot(`
      <a
        href="for-complex?even-more#and-more"
        onClick={[Function]}
      />
    `);
  });

  it("should render with new href property", () => {
    const wrapper = shallow(<Link href="http://192.168.100.163" />);
    expect(wrapper).toMatchInlineSnapshot(`
    <a
      href="http://192.168.100.163"
      onClick={[Function]}
    />
    `);
  });
});
