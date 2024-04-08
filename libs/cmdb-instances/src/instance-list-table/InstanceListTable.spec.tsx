import "@testing-library/jest-dom/extend-expect";
import React from "react";
import {
  render,
  fireEvent,
  cleanup,
  getByText,
  getByTestId,
} from "@testing-library/react";
import { act } from "@testing-library/react";
import * as kit from "@next-core/brick-kit";
import {
  ReadPaginationChangeDetail,
  ReadSortingChangeDetail,
  PropertyDisplayType,
  UseSingleBrickConf,
} from "@next-core/brick-types";
import { CmdbObjectApi_getIdMapName } from "@next-sdk/cmdb-sdk";
import { http } from "@next-core/brick-http";

import { InstanceListTable } from "./InstanceListTable";
import { getInstanceListData, HOST } from "./data-providers/__mocks__";
import { mount } from "enzyme";
import { message, Table } from "antd";

kit.createHistory();

jest.spyOn(kit, "BrickAsComponent").mockImplementation(({ useBrick, data }) => (
  <>
    brick:{" "}
    <span data-testid={`row-${(data as Record<string, any>).index}-brick`}>
      {(useBrick as UseSingleBrickConf).brick}
    </span>
    <br />
    data:{" "}
    <span data-testid={`row-${(data as Record<string, any>).index}-data`}>
      {JSON.stringify(data)}
    </span>
  </>
));
document.execCommand = jest.fn();

jest.mock("@next-sdk/cmdb-sdk");
jest.mock("@next-core/brick-http");

const mockCmdbObjectApi_getIdMapName = CmdbObjectApi_getIdMapName as jest.Mock;

const ipAttr = HOST.attrList.find((attr) => attr.id === "ip");
const idObjectMap = { HOST };
const detailUrlTemplates = {
  HOST: "/cmdb-instances/#{objectId}/instance/#{instanceId}",
  default: "/cmdb-instances/#{objectId}/instance/#{instanceId}",
};

const mockOnPaginationChange = jest.fn();
const mockOnSortingChange = jest.fn();
const mockOnSelectionChange = jest.fn();
const mockHandleDeleteFunction = jest.fn();

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
    const mockOnColumnsChange = jest.fn();
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
        onColumnsChange={mockOnColumnsChange}
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
    expect(
      mockOnColumnsChange.mock.calls[
        mockOnColumnsChange.mock.calls.length - 1
      ][0]
    ).toEqual(
      expect.arrayContaining([
        {
          dataIndex: "ip",
        },
        {
          dataIndex: "cpu",
        },
        {
          dataIndex: "status",
        },
        {
          dataIndex: "hostname",
        },
        {
          dataIndex: "owner",
        },
        {
          dataIndex: "_deviceList_CLUSTER",
        },
      ])
    );
  });

  it("should call function that is passed to the onClickItem property when click link", () => {
    const instanceListData = getInstanceListData();
    const mockOnClickItem = jest.fn((e: React.MouseEvent, id: string) => null);
    const { getAllByTestId } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onClickItem={mockOnClickItem}
      />
    );
    // fireEvent.click(getAllByTestId("instance-detail-link")[0]);
    // expect(mockOnClickItem).toBeCalled();
    // expect(
    //   mockOnClickItem.mock.calls[mockOnClickItem.mock.calls.length - 1][1] ===
    //   instanceListData.list[0].instanceId
    // ).toBeTruthy();
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
    // fireEvent.click(getAllByTestId("instance-detail-link")[0]);
  });

  it("should call function that is passed to the onPaginationChange property when click page 2", () => {
    const total = 3;
    let page = 1;
    let pageSize = 2;
    let instanceListData = getInstanceListData(total, page, pageSize);
    const {
      container,
      rerender,
      getByText: getByTextWithContainer,
    } = render(
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
        fieldIds={["hostname"]}
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
    const {
      container,
      rerender,
      getByText: getByTextWithContainer,
    } = render(
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
  it(`should work with isOperate`, () => {
    const instanceListData = getInstanceListData();
    const { container } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        isOperate={true}
        handleDeleteFunction={mockHandleDeleteFunction}
      />
    );
    mockHandleDeleteFunction.mockImplementationOnce((v) => {
      return;
    });
    fireEvent.click(getByTestId(container, "button-up-1"));
    expect(mockHandleDeleteFunction).not.toBeCalled();
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
        selectedRowKeys={[]}
        ipCopy={true}
      />
    );
    const spyOnMessageWarning = jest.spyOn(message, "warning");
    fireEvent.click(container.querySelector(".copyWrap svg"));
    expect(spyOnMessageWarning).toHaveBeenCalled();

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

    fireEvent.click(container.querySelector(".copyWrap svg"));
  });

  it(`should ipCopy `, () => {
    const instanceListData = getInstanceListData();
    const instance = instanceListData.list[0];
    const spyOnMessage = jest.spyOn(message, "success");

    const { container } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onSelectionChange={mockOnSelectionChange}
        selectedRowKeys={[instance.instanceId]}
        ipCopy={true}
      />
    );
    fireEvent.click(container.querySelector(".copyWrap svg"));
    act(async () => {
      await (global as any).flushPromises();
      expect(spyOnMessage).toHaveBeenCalled();
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

  it("should work displayConfig with useBrick", () => {
    const instanceListData = getInstanceListData(2, 1, 2);
    const attributeKey = "status";
    const brick = "span";
    const { getByTestId } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        propertyDisplayConfigs={[
          {
            key: attributeKey,
            useBrick: {
              brick,
              properties: {
                textContent: "<% DATA.cellData %>",
              },
            },
          },
        ]}
      />
    );
    const index = 0;
    const instance = instanceListData.list[index];
    expect(getByTestId(`row-${index}-brick`)).toHaveTextContent(brick);
    expect(JSON.parse(getByTestId(`row-${index}-data`).textContent)).toEqual({
      cellData: instance[attributeKey],
      rowData: instance,
      index,
    });
  });

  it("should work with extraColumns property", () => {
    const instanceListData = getInstanceListData(2, 1, 2);
    const extraFieldKey = "extraField";
    const brick = "span";

    instanceListData.list = instanceListData.list.map((instance, index) => ({
      ...instance,
      [extraFieldKey]: `extra field value ${index}`,
    }));

    const mockOnColumnsChange = jest.fn();
    const { getByTestId } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        extraColumns={[
          {
            title: "Extra Field",
            dataIndex: extraFieldKey,
            useBrick: { brick },
          },
        ]}
        onColumnsChange={mockOnColumnsChange}
      />
    );

    const index = 0;
    const instance = instanceListData.list[index];
    expect(getByTestId(`row-${index}-brick`)).toHaveTextContent(brick);
    expect(JSON.parse(getByTestId(`row-${index}-data`).textContent)).toEqual({
      cellData: instance[extraFieldKey],
      rowData: instance,
      index,
    });

    expect(
      mockOnColumnsChange.mock.calls[
        mockOnColumnsChange.mock.calls.length - 1
      ][0]
    ).toEqual(
      expect.arrayContaining([
        {
          dataIndex: "ip",
        },
        {
          dataIndex: "_agentStatus",
        },
        {
          dataIndex: "cpu",
        },
        {
          dataIndex: "cpuHz",
        },
        {
          dataIndex: "cpuModel",
        },
        {
          dataIndex: "cpus",
        },
        {
          dataIndex: "diskSize",
        },
        {
          dataIndex: "eth",
        },
        {
          dataIndex: "memSize",
        },
        {
          dataIndex: "memo",
        },
        {
          dataIndex: "status",
        },
        {
          dataIndex: "hostname",
        },
        {
          dataIndex: "owner",
        },
        {
          dataIndex: "_deviceList_CLUSTER",
        },
        {
          dataIndex: "osArchitecture",
        },
        {
          dataIndex: "osDistro",
        },
        {
          dataIndex: "osRelease",
        },
        {
          dataIndex: "osSystem",
        },
        {
          dataIndex: "osVersion",
        },
        {
          dataIndex: "tag",
        },
        {
          dataIndex: "json",
        },
        {
          dataIndex: "bool",
        },
        {
          dataIndex: "extraField",
        },
      ])
    );
  });

  it("should work when model's isAbstract is true", async () => {
    const instanceListData = getInstanceListData();
    const onInstanceSourceChange = jest.fn();
    const mockOnColumnsChange = jest.fn();
    const wrapper = mount(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={{ ...HOST, isAbstract: true }}
        instanceListData={instanceListData}
        onInstanceSourceChange={onInstanceSourceChange}
        filterInstanceSourceDisabled={true}
        onColumnsChange={mockOnColumnsChange}
      />
    );
    expect(mockCmdbObjectApi_getIdMapName).toBeCalled();
    expect((wrapper.find(Table).prop("columns")[0] as any).dataIndex).toBe(
      "_object_id"
    );
    expect(wrapper.find(Table).prop("columns")[0]).not.toHaveProperty(
      "filters"
    );

    expect(
      mockOnColumnsChange.mock.calls[
        mockOnColumnsChange.mock.calls.length - 1
      ][0]
    ).toEqual(
      expect.arrayContaining([
        {
          dataIndex: "_object_id",
        },
        {
          dataIndex: "ip",
        },
        {
          dataIndex: "_agentStatus",
        },
        {
          dataIndex: "cpu",
        },
        {
          dataIndex: "cpuHz",
        },
        {
          dataIndex: "cpuModel",
        },
        {
          dataIndex: "cpus",
        },
        {
          dataIndex: "diskSize",
        },
        {
          dataIndex: "eth",
        },
        {
          dataIndex: "memSize",
        },
        {
          dataIndex: "memo",
        },
        {
          dataIndex: "status",
        },
        {
          dataIndex: "hostname",
        },
        {
          dataIndex: "owner",
        },
        {
          dataIndex: "_deviceList_CLUSTER",
        },
        {
          dataIndex: "osArchitecture",
        },
        {
          dataIndex: "osDistro",
        },
        {
          dataIndex: "osRelease",
        },
        {
          dataIndex: "osSystem",
        },
        {
          dataIndex: "osVersion",
        },
        {
          dataIndex: "tag",
        },
        {
          dataIndex: "json",
        },
        {
          dataIndex: "bool",
        },
      ])
    );

    await act(async () => {
      wrapper.setProps({
        filterInstanceSourceDisabled: false,
        instanceSourceQuery: "HOST",
        inheritanceModelIdNameMap: {
          HOST: "主机",
          APP: "应用",
        },
      });

      await (global as any).flushPromises();
    });
    wrapper.update();
    expect(wrapper.find(Table).prop("columns")[0]).toHaveProperty("filters");
    expect(wrapper.find(Table).prop("columns")[0].filteredValue).toEqual([
      "HOST",
    ]);
    wrapper.find(Table).invoke("onChange")(
      {},
      { _object_id: ["APP"] },
      {},
      {} as any
    );
    expect(onInstanceSourceChange).lastCalledWith("APP");
    expect(
      mockOnColumnsChange.mock.calls[
        mockOnColumnsChange.mock.calls.length - 1
      ][0]
    ).toEqual([
      {
        dataIndex: "_object_id",
      },
      {
        dataIndex: "ip",
      },
      {
        dataIndex: "_agentStatus",
      },
      {
        dataIndex: "cpu",
      },
      {
        dataIndex: "cpuHz",
      },
      {
        dataIndex: "cpuModel",
      },
      {
        dataIndex: "cpus",
      },
      {
        dataIndex: "diskSize",
      },
      {
        dataIndex: "eth",
      },
      {
        dataIndex: "memSize",
      },
      {
        dataIndex: "memo",
      },
      {
        dataIndex: "status",
      },
      {
        dataIndex: "hostname",
      },
      {
        dataIndex: "owner",
      },
      {
        dataIndex: "_deviceList_CLUSTER",
      },
      {
        dataIndex: "osArchitecture",
      },
      {
        dataIndex: "osDistro",
      },
      {
        dataIndex: "osRelease",
      },
      {
        dataIndex: "osSystem",
      },
      {
        dataIndex: "osVersion",
      },
      {
        dataIndex: "tag",
      },
      {
        dataIndex: "json",
      },
      {
        dataIndex: "bool",
      },
    ]);
  });
  it("should work rowSelection's rowSelectionType is radio", () => {
    const instanceListData = getInstanceListData();
    const instance = instanceListData.list[0];
    const { container } = render(
      <InstanceListTable
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        rowSelectionType="radio"
      />
    );
    fireEvent.click(
      container
        .querySelector(`[data-row-key="${instance.instanceId}"]`)
        .getElementsByClassName("ant-table-selection-column")[0]
        .querySelector("label.ant-radio-wrapper")
    );
    expect(mockOnSelectionChange).toBeCalledWith({
      selectedKeys: [instance.instanceId],
      selectedItems: [instance],
    });
  });

  it("should work with test property hiddenColumns", () => {
    const instanceListData = getInstanceListData();
    const instance = instanceListData.list[0];
    const mockOnColumnsChange = jest.fn();
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
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        rowSelectionType="radio"
        hiddenColumns={["ip"]}
        onColumnsChange={mockOnColumnsChange}
      />
    );
    fireEvent.click(
      container
        .querySelector(`[data-row-key="${instance.instanceId}"]`)
        .getElementsByClassName("ant-table-selection-column")[0]
        .querySelector("label.ant-radio-wrapper")
    );
    expect(mockOnSelectionChange).toBeCalledWith({
      selectedKeys: [instance.instanceId],
      selectedItems: [instance],
    });
    expect(
      mockOnColumnsChange.mock.calls[
        mockOnColumnsChange.mock.calls.length - 1
      ][0]
    ).toEqual(
      expect.arrayContaining([
        {
          dataIndex: "cpu",
        },
        {
          dataIndex: "status",
        },
        {
          dataIndex: "hostname",
        },
        {
          dataIndex: "owner",
        },
        {
          dataIndex: "_deviceList_CLUSTER",
        },
      ])
    );
  });
  it("should work with test property showCustomizedSerialNumber", () => {
    const instanceListData = getInstanceListData();
    const mockOnColumnsChange = jest.fn();
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
        detailUrlTemplates={detailUrlTemplates}
        idObjectMap={idObjectMap}
        modelData={HOST}
        instanceListData={instanceListData}
        onColumnsChange={mockOnColumnsChange}
        showCustomizedSerialNumber={true}
      />
    );

    expect(
      container
        .querySelector(".ant-table-thead")
        .getElementsByClassName("ant-table-cell")[1].textContent
    ).toBe("序号");
    expect(
      container
        .querySelectorAll("tbody tr")[1]
        .getElementsByClassName("ant-table-cell")[1].textContent
    ).toBe("1");
    expect(
      container
        .querySelectorAll("tbody tr")[2]
        .getElementsByClassName("ant-table-cell")[1].textContent
    ).toBe("2");
  });
});
