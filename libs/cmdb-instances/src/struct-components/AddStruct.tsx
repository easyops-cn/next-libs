import React, { CSSProperties } from "react";
import { Button } from "antd";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import { StructTable } from "./StructTable";
import { AddStructModal } from "./AddStructModal";
import { isArray, isEmpty } from "lodash";
import { Attribute } from "./interfaces";
import { CmdbModels } from "@next-sdk/cmdb-sdk";

export interface AddStructProps {
  style?: CSSProperties;
  structData?: any;
  attribute: Partial<CmdbModels.ModelObjectAttr>;
  handleStoreFunction: (value: any) => void;
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
      showModal: false,
    };
  }
  // 编辑结构体
  handleEditStruct = (formData: any) => {
    const { isLegacy } = this.props;
    const output = isLegacy
      ? Array.isArray(formData)
        ? formData[0]
        : formData
      : formData;
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
      showModal: false,
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
          {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ADD}`)}
        </Button>
        <AddStructModal
          // 新建的情况下不必给初值，初值为空对象时codeEditor才能正常回填
          structData={{}}
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
