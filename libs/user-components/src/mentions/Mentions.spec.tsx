import React from "react";
import { Mentions } from "./Mentions";
import "@testing-library/jest-dom";
import { mount, shallow } from "enzyme";
import { Mentions as AMentions } from "antd";

jest.mock("@next-sdk/cmdb-sdk");
jest.mock("@next-libs/hooks/src/mention/useMention");
const data = [
  {
    instanceId: "5853285536d5d",
    name: "easyops1",
    nickname: "",
    user_email: "aaa@easyops.cn",
    user_icon: "assets/favicon.png",
  },
  {
    instanceId: "588e94254e66d",
    name: "easyops_invalid",
    user_email: "xxxxx@easyops.cn",
    user_icon: "assets/favicon.png",
  },
];
jest.mock("@next-libs/hooks", () => ({
  useMention: () => ({ users: data, updateUserName: jest.fn }),
}));

describe("Mentions", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should work", () => {
    const mockOnSearch = jest.fn();
    const wrapper = shallow(<Mentions onSearch={mockOnSearch} />);
    wrapper.find(AMentions).invoke("onSearch")("a", "b");
    expect(mockOnSearch).toHaveBeenCalledWith("a", "b");
    expect(wrapper.find(AMentions.Option)).toHaveLength(2);
    expect(wrapper.find(AMentions.Option).at(0).prop("value")).toBe("easyops1");
  });

  it("should work showkey", async () => {
    const mockOnSearch = jest.fn();
    const wrapper = shallow(
      <Mentions onSearch={mockOnSearch} showkey={["name", "user_email"]} />
    );
    await jest.runAllTimers();
    expect(wrapper.find(AMentions.Option)).toHaveLength(2);
    expect(wrapper.find(AMentions.Option).at(0).prop("value")).toBe(
      "easyops1/aaa@easyops.cn"
    );
  });
});
