import React from "react";
import { shallow } from "enzyme";
import { StructTable } from "./StructTable";
import { AddStructModal } from "./AddStructModal";
import { attribute, structData, structData2 } from "./mockData";
import { Button, Modal } from "antd";

const spyOnModalConfirm = jest.spyOn(Modal, "confirm");

describe("StructTable", () => {
  const handleStoreFunction = jest.fn();
  const structsProps = {
    attribute,
    structData: [structData, structData2],
    isEditable: true,
    isLegacy: false,
    handleStoreFunction,
  };
  const structProps = {
    attribute,
    structData: structData,
    isEditable: true,
    isLegacy: true,
    handleStoreFunction,
  };
  const structsWrapper = shallow(<StructTable {...structsProps} />);
  const structsInstance = structsWrapper.instance() as StructTable;
  const structWrapper = shallow(<StructTable {...structProps} />);
  const structInstance = structWrapper.instance() as StructTable;
  const structsOperationWrapper = shallow(
    structsInstance.renderOperation(structData, 0)
  );
  const structOperationWrapper = shallow(
    structInstance.renderOperation(structData, 0)
  );
  const formData = { str: "newString" };
  it("should render", () => {
    expect(structsWrapper.find("Table").length).toBe(1);
    expect(structsWrapper).toBeTruthy();
    expect(structWrapper).toBeTruthy();
    expect(structsOperationWrapper).toBeTruthy();
    expect(structOperationWrapper).toBeTruthy();
  });
  // 打开结构体编辑弹窗
  it("should call handleOpenEditModal function", () => {
    structsOperationWrapper.find(Button).at(0).prop("onClick")(
      expect.anything()
    );
    expect(structsInstance.state.showEditModal).toEqual(true);
    expect(structsInstance.state.currentIndex).toEqual(0);
  });
  // 打开删除确认弹窗
  it("should call openConfirmModal function", () => {
    structsOperationWrapper.find(Button).at(1).prop("onClick")(
      expect.anything()
    );
    expect(spyOnModalConfirm).toBeCalled();
    expect(spyOnModalConfirm.mock.calls[
      spyOnModalConfirm.mock.calls.length - 1
    ][0].title).toEqual("libs-cmdb-instances:DELETE_STRUCT_CONFIRM_MSG");
  });
  //编辑结构体
  it("should call the edit structs function", () => {
    const spy = jest.spyOn(structsProps, "handleStoreFunction");
    structsOperationWrapper
      .find(AddStructModal)
      .at(0)
      .prop("handleStoreFunction")(formData, 0);
    expect(spy).toBeCalledWith([formData, structData2]);
  });
  // 删除结构体
  it("should call with a struct array", () => {
    const spy = jest.spyOn(structsProps, "handleStoreFunction");
    structsInstance.remove(0);
    expect(spy).toBeCalledWith([structData2]);
  });
  //编辑单结构体
  it("should call the edit struct function", () => {
    const spy = jest.spyOn(structProps, "handleStoreFunction");
    structOperationWrapper
      .find(AddStructModal)
      .at(0)
      .prop("handleStoreFunction")(formData, 0);
    expect(spy).toBeCalledWith([formData]);
  });
  // 删除单结构体
  it("should call with a struct object", () => {
    const spy = jest.spyOn(structsProps, "handleStoreFunction");
    structInstance.remove(0);
    expect(spy).toBeCalledWith({});
  });
  //点击删除确认弹窗的确定按钮
  it("should call the remove function when click Ok button of confirm modal", () => {
    structsOperationWrapper.find(Button).at(1).prop("onClick")(
      expect.anything()
    );
    const spy = jest.spyOn(structsProps, "handleStoreFunction");
    spyOnModalConfirm.mock.calls[
      spyOnModalConfirm.mock.calls.length - 1
    ][0].onOk();
    expect(spy).toBeCalled();
  });
});
