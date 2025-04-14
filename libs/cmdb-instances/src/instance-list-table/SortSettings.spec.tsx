import React from "react";
import { shallow } from "enzyme";
import { SortSettings } from "./SortSettings";
import { HOST } from "./data-providers/__mocks__";
import { Table } from "antd";

describe("SortSettings", () => {
  it("should work", async () => {
    const handleSortEnd = jest.fn();
    const modelData = HOST;
    const currentFields = ["hostname", "ip", "_agentStatus", "memSize"];
    const wrapper = shallow(
      <SortSettings
        rowKey="id"
        modelData={modelData}
        currentFields={currentFields}
        onSortEnd={handleSortEnd}
      />
    );
    expect(wrapper.find(Table).props().dataSource.length).toEqual(4);
  });
});
