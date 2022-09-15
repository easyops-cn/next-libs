import React from "react";
import { Mentions } from "./Mentions";
import "@testing-library/jest-dom";
import { mount, shallow } from "enzyme";
import { Mentions as AMentions } from "antd";
jest.mock("@next-sdk/user-service-sdk");
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
    expect(wrapper.find(AMentions.Option)).toHaveLength(0);
  });
});
