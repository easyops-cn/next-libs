import React, { CSSProperties } from "react";
import { Button } from "antd";
import { StructTable } from "./StructTable";
import { AddStructModal } from "./AddStructModal";
import { isArray, isEmpty } from "lodash";
import { Attribute } from "./interfaces";
import { CmdbModels } from "@sdk/cmdb-sdk";

export interface AddStructProps {
  style?: CSSProperties;
  structData?: any;
  attribute: Partial<CmdbModels.ModelObjectAttr>;
  handleStoreFunction: Function;
  isLegacy?: boolean;
  className?: string;
}
export interface AddStructState {
  showModal: boolean;
  structData: any;
  isEdit?: boolean;
}
export class AddStruct extends React.Component<AddStructProps, AddStructState> {
  constructor(props: AddStructProps) {
    super(props);
    this.state = {
      structData: props.structData,
      showModal: false
    };
  }
  // 编辑结构体
  handleEditStruct = (formData: any) => {
    const { isLegacy } = this.props;
    const output = isLegacy ? formData[0] : formData;
    this.setState({ showModal: false });
    this.props.handleStoreFunction(output);
  };
  // 新建结构体
  handleAddStruct = (formData: any) => {
    const { isLegacy, structData } = this.props;
    this.props.handleStoreFunction(
      isLegacy
        ? formData
        : isArray(structData)
        ? [...structData, formData]
        : [formData]
    );
    this.handleCloseModal();
  };
  handleCloseModal = () => {
    this.setState({
      showModal: false
    });
  };
  handleOpenAddModal = () => {
    this.setState({ showModal: true });
  };
  render() {
    const { structData, attribute, isLegacy, className } = this.props;
    const { showModal } = this.state;
    return (
      <div className={className}>
        {/* 单结构体并且已经添加过的，添加按钮置灰 */}
        <Button
          type="link"
          disabled={isLegacy && !isEmpty(structData)}
          onClick={this.handleOpenAddModal}
        >
          添加
        </Button>
        <AddStructModal
          attribute={attribute as Attribute}
          visible={showModal}
          handleStoreFunction={(formData: any) =>
            this.handleAddStruct(formData)
          }
          handleCancelFunction={this.handleCloseModal}
        />
        <StructTable
          structData={structData}
          attribute={attribute as Attribute}
          isEditable={true}
          isLegacy={isLegacy}
          handleStoreFunction={this.handleEditStruct}
        />
      </div>
    );
  }
}
