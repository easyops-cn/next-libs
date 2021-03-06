import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, fireEvent, cleanup, getByText } from "@testing-library/react";
import { createHistory } from "@next-core/brick-kit";
import {
  ReadPaginationChangeDetail,
  ReadSortingChangeDetail,
  PropertyDisplayType,
} from "@next-core/brick-types";

import { InstanceListTable } from "./InstanceListTable";
import { getInstanceListData, HOST } from "./data-providers/__mocks__";
createHistory();

const ipAttr = HOST.attrList.find((attr) => attr.id === "ip");
const idObjectMap = { HOST };
const detailUrlTemplates = {
  default: "/cmdb-instances/#{objectId}/instance/#{instanceId}",
};

const mockOnPaginationChange = jest.fn();
const mockOnSortingChange = jest.fn();
const mockOnSelectionChange = jest.fn();
const mockElementName = "mock-element";

function getRelationValue(instances: Record<string, any>[]): string {
  return String(instances.map((instance) => instance.name));
}

afterEach(() => {
  cleanup();
  mockOnPaginationChange.mockClear();
  mockOnSortingChange.mockClear();
});

describe("InstanceListTable", () => {
  it("should init with passed data", () => {
    const page = 2;
    const instanceListData = getInstanceListData(3, page, 2);
    const { container } = render(
      <InstanceListTable
        fieldIds={[
          "ip",
          "cpu",
          "status",
          "hostname",
          "owner",
          "_deviceList_CLUSTER",
        ]}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        sort={ipAttr.id}
        asc={true}
        relationLinkDisabled={true}
      />
    );
    expect(
      getByText(
        container.getElementsByClassName("ant-pagination")[0] as HTMLElement,
        `${page}`
      ).closest(".ant-pagination-item-active")
    ).not.toBeNull();
    expect(
      getByText(
        container.getElementsByClassName("ant-table-thead")[0] as HTMLElement,
        ipAttr.name
      ).parentElement.getElementsByClassName("ant-table-column-sorter-up")[0]
    ).toHaveClass("active");
  });

  it("should call function that is passed to the onClickItem property when click link", () => {
    const instanceListData = getInstanceListData();
    const mockOnClickItem = jest.fn(
      (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => null
    );
    const { getAllByTestId } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onClickItem={mockOnClickItem}
      />
    );
    fireEvent.click(getAllByTestId("instance-detail-link")[0]);
    expect(mockOnClickItem).toBeCalled();
    expect(
      mockOnClickItem.mock.calls[mockOnClickItem.mock.calls.length - 1][1] ===
        instanceListData.list[0].instanceId
    ).toBeTruthy();
  });

  it("should not throw error after link clicked, when there is not function passed to the onClickItem property", () => {
    const instanceListData = getInstanceListData();
    const { getAllByTestId } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
      />
    );
    fireEvent.click(getAllByTestId("instance-detail-link")[0]);
  });

  it("should call function that is passed to the onPaginationChange property when click page 2", () => {
    const total = 3;
    let page = 1;
    let pageSize = 2;
    let instanceListData = getInstanceListData(total, page, pageSize);
    const { container, rerender, getByText: getByTextWithContainer } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onPaginationChange={mockOnPaginationChange}
      />
    );
    mockOnPaginationChange.mockImplementationOnce(
      (pagination: ReadPaginationChangeDetail) => {
        page = pagination.page;
        pageSize = pagination.pageSize;
        instanceListData = getInstanceListData(total, page, pageSize);
      }
    );
    fireEvent.click(
      getByText(
        container.getElementsByClassName("ant-pagination")[0] as HTMLElement,
        `${page + 1}`
      )
    );
    expect(mockOnPaginationChange).toBeCalledWith({
      page,
      pageSize,
    });
    expect(mockOnSortingChange).not.toBeCalled();
    rerender(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onPaginationChange={mockOnPaginationChange}
      />
    );
    expect(
      getByTextWithContainer(instanceListData.list[0].hostname)
    ).toBeTruthy();
  });

  it("should not throw error after page 2 clicked, when there is not function passed to the onPaginationChange property", () => {
    const instanceListData = getInstanceListData(3, 1, 2);
    const { container } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
      />
    );
    fireEvent.click(
      getByText(
        container.getElementsByClassName("ant-pagination")[0] as HTMLElement,
        "2"
      )
    );
  });

  it(`should call function that is passed to the onSortingChange property when click table head "${ipAttr.name}"`, () => {
    const instanceListData = getInstanceListData();
    const { container, rerender, getByText: getByTextWithContainer } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onPaginationChange={mockOnPaginationChange}
        onSortingChange={mockOnSortingChange}
      />
    );
    let sort: string;
    let asc: boolean;
    mockOnSortingChange.mockImplementationOnce(
      (sorting: ReadSortingChangeDetail) => {
        sort = sorting.sort;
        asc = sorting.asc;
      }
    );
    fireEvent.click(
      getByText(
        container.getElementsByClassName("ant-table-thead")[0] as HTMLElement,
        ipAttr.name
      )
    );
    expect(mockOnSortingChange).toBeCalledWith({
      sort: ipAttr.id,
      asc: true,
    });
    expect(mockOnPaginationChange).not.toBeCalled();
    rerender(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        sort={sort}
        asc={asc}
        onPaginationChange={mockOnPaginationChange}
        onSortingChange={mockOnSortingChange}
      />
    );
    expect(
      getByText(
        container.getElementsByClassName("ant-table-thead")[0] as HTMLElement,
        ipAttr.name
      ).parentElement.getElementsByClassName("ant-table-column-sorter-up")[0]
    ).toHaveClass("active");
  });

  it(`should not throw error after table head "${ipAttr.name}" clicked, when there is not function passed to the onSortingChange property`, () => {
    const instanceListData = getInstanceListData();
    const { container } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
      />
    );
    fireEvent.click(
      getByText(
        container.getElementsByClassName("ant-table-thead")[0] as HTMLElement,
        ipAttr.name
      )
    );
  });

  it(`should call function that is passed to the onSelectionChange property when click the selection checkbox of table row`, () => {
    const instanceListData = getInstanceListData();
    const instance = instanceListData.list[0];
    const { container } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    fireEvent.click(
      container
        .querySelector(`[data-row-key="${instance.instanceId}"]`)
        .getElementsByClassName("ant-table-selection-column")[0]
        .querySelector("label.ant-checkbox-wrapper")
    );
    expect(mockOnSelectionChange).toBeCalledWith({
      selectedKeys: [instance.instanceId],
      selectedItems: [instance],
    });
  });

  it(`should not throw error after table head "${ipAttr.name}" clicked, when there is not function passed to the onSelectionChange property`, () => {
    const instanceListData = getInstanceListData();
    const instance = instanceListData.list[0];
    const { container } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
      />
    );
    fireEvent.click(
      container
        .querySelector(`[data-row-key="${instance.instanceId}"]`)
        .getElementsByClassName("ant-table-selection-column")[0]
        .querySelector("label.ant-checkbox-wrapper")
    );
  });

  it("should use custom element to render table cell ", async () => {
    const instanceListData = getInstanceListData();
    const attributeKey = "hostname";
    const relationKey = "_deviceList_CLUSTER";
    const attributeValue = instanceListData.list[0][attributeKey];
    const relationValue = getRelationValue(
      instanceListData.list[0][relationKey]
    );
    const { queryByText, getByText } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        propertyDisplayConfigs={[
          { key: attributeKey, brick: mockElementName },
          { key: relationKey, brick: mockElementName },
        ]}
      />
    );
    // await waitForElement(() => queryByText(attributeValue));
    // expect(getByText(attributeValue).tagName.toLowerCase()).toBe(
    //   mockElementName
    // );
    // expect(
    //   getByText(relationValue).tagName.toLowerCase()
    // ).toBe(mockElementName);
  });

  it("should use tag to display value ", async () => {
    const instanceListData = getInstanceListData(2, 1, 2);
    const attributeKey = "status";
    const attributeValue = instanceListData.list[0][attributeKey];
    const { getAllByText } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        propertyDisplayConfigs={[
          {
            key: attributeKey,
            type: PropertyDisplayType.Tag,
            valueColorMap: { 运营中: "green" },
          },
          {
            key: "tag",
            type: PropertyDisplayType.Tag,
          },
        ]}
      />
    );
    expect(getAllByText(attributeValue)[0]).toHaveClass(
      "ant-tag",
      "ant-tag-green"
    );
  });
});
