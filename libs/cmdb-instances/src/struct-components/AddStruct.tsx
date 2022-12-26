import React, { CSSProperties } from "react";
import { Button, Input } from "antd";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import { StructTable } from "./StructTable";
import { AddStructModal } from "./AddStructModal";
import { isArray, isEmpty, compact } from "lodash";
import { Attribute } from "./interfaces";
import { CmdbModels } from "@next-sdk/cmdb-sdk";

export interface AddStructProps {
  style?: CSSProperties;
  structData?: any;
  attribute: Partial<CmdbModels.ModelObjectAttr>;
  handleStoreFunction: (value: any) => void;
  isLegacy?: boolean;
  className?: string;
  isCreate?: boolean;
}
export interface AddStructState {
  showModal: boolean;
  structData: any;
  isEdit?: boolean;
  serachValue?: string;
}
export class AddStruct extends React.Component<AddStructProps, AddStructState> {
  constructor(props: AddStructProps) {
    super(props);
    this.state = {
      structData: props.structData,
      showModal: false,
      serachValue: "",
    };
  }
  // 编辑结构体
  // istanbul ignore next
  handleEditStruct = (formData: any) => {
    const { isLegacy, structData } = this.props;
    const output = isLegacy
      ? Array.isArray(formData)
        ? formData[0]
        : formData
      : formData;
    this.setState({ showModal: false });
    let restStructData: any = [];
    if (this.state.serachValue && Array.isArray(structData)) {
      restStructData = compact(
        structData?.map((r: any) => {
          const values: string[] = Object.values(r);
          if (
            !values?.find((s: string) =>
              s?.toString()?.match(this.state.serachValue)
            )
          ) {
            return r;
          }
        })
      );
    }
    this.props.handleStoreFunction(
      Array.isArray(output) ? [...restStructData, ...output] : output
    );
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
  // istanbul ignore next
  onSearch = (value: string) => {
    let structData = this.props.structData;
    if (value) {
      structData = compact(
        structData?.map((r: any) => {
          const values: string[] = Object.values(r);
          if (values?.find((s: string) => s?.toString()?.match(value))) {
            return r;
          }
        })
      );
    }
    this.setState({
      structData,
      serachValue: value,
    });
  };
  // istanbul ignore next
  componentDidUpdate(
    prevProps: Readonly<AddStructProps>,
    prevState: Readonly<AddStructState>,
    snapshot?: any
  ): void {
    if (prevProps.structData !== this.props.structData) {
      this.setState({
        structData: this.state.serachValue
          ? compact(
              this.props.structData.map((r: any) => {
                const values: string[] = Object.values(r);
                if (
                  values?.find((s: string) =>
                    s?.toString()?.match(this.state.serachValue)
                  )
                ) {
                  return r;
                }
              })
            )
          : this.props.structData,
      });
    }
  }

  render() {
    const { structData, attribute, isLegacy, className } = this.props;
    const { showModal } = this.state;
    return (
      <div className={className}>
        {/* 单结构体并且已经添加过的，添加按钮置灰 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          {
            // istanbul ignore next
            // 单结构体不支持搜索
            Array.isArray(this.props.structData) && (
              <Input.Search
                style={{ width: 300 }}
                onSearch={(value) => {
                  this.onSearch(value);
                }}
                enterButton
              />
            )
          }
          <Button
            type="link"
            disabled={
              (isLegacy && !isEmpty(structData)) ||
              (attribute.readonly === "true" && !this.props.isCreate)
            }
            onClick={this.handleOpenAddModal}
          >
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ADD}`)}
          </Button>
        </div>

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
          structData={this.state.structData}
          attribute={attribute as Attribute}
          isEditable={
            this.props.attribute.readonly === "false" || this.props.isCreate
          }
          isLegacy={isLegacy}
          handleStoreFunction={this.handleEditStruct}
        />
      </div>
    );
  }
}
