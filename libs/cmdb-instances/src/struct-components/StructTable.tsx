import React from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Modal, Table } from "antd";
import { Attribute, Structkey } from "./interfaces";
import { isEmpty, isObject } from "lodash";
import { AddStructModal } from "./AddStructModal";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import styles from "./index.module.css";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { Typography } from "antd";
export interface StructTableProps {
  attribute: Attribute;
  structData: any;
  isEditable?: boolean;
  // 是否单结构体
  isLegacy?: boolean;
  size?: SizeType;
  handleStoreFunction?(data: any): void;
}
export interface StructTableState {
  structData: any;
  currentIndex: number;
  showEditModal: boolean;
}
export class StructTable extends React.Component<
  StructTableProps,
  StructTableState
> {
  constructor(props: StructTableProps) {
    super(props);
    this.state = {
      structData: props.structData,
      currentIndex: 0,
      showEditModal: false,
    };
  }
  getColumns(defines: Structkey[]) {
    const columns = defines.map((item: Structkey) => ({
      title: item.name,
      className: styles.structTableTd,
      dataIndex: item.id,
      render: (text: any, _record: any, _index: number) => {
        let copyText: string;
        let showText: string;
        switch (item.type) {
          case "bool":
            return String(text);
          case "enums":
          case "arr":
            return text?.join?.("; ");
          case "json":
            copyText = isObject(text) ? JSON.stringify(text, null, 2) : text;
            showText = isObject(text) ? JSON.stringify(text) : text;
            if (copyText) {
              return (
                <Typography.Paragraph
                  copyable={{
                    tooltips: [
                      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.COPY}`),
                      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.COPY_SUCCESS}`),
                    ],
                    text: copyText,
                  }}
                >
                  {showText}
                </Typography.Paragraph>
              );
            }
            return showText;
          default:
            return text;
        }
      },
    }));
    if (this.props.isEditable) {
      columns.push({
        title: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.OPERATION}`),
        className: styles.structTableTd,
        dataIndex: "operation",
        render: (_text: string, record: any, index: number): any => {
          return this.renderOperation(record, index);
        },
      });
    }
    return columns;
  }
  openConfirmModal(index: number) {
    const confirm = Modal.confirm;

    confirm({
      title: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.DELETE_STRUCT_CONFIRM_MSG}`),
      okText: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONFIRM}`),
      okType: "danger",
      cancelText: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CANCEL}`),
      onOk: () => {
        this.remove(index);
      },
    });
  }
  remove(index: number) {
    let { structData, isLegacy } = this.props;
    if (isLegacy) {
      structData = {};
    } else {
      structData.splice(index, 1);
    }
    this.props.handleStoreFunction(structData);
  }
  handleEditStruct = (formData: any, index: number) => {
    let { structData, isLegacy } = this.props;
    if (isLegacy) {
      structData = [structData];
    }
    structData[index] = formData;
    this.props.handleStoreFunction(structData);
    this.handleCloseModal();
  };
  handleOpenEditModal = (index: number) => {
    this.setState({
      showEditModal: true,
      currentIndex: index,
    });
  };
  handleCloseModal = () => {
    this.setState({ showEditModal: false });
  };
  renderOperation = (record: any, index: number) => {
    const { attribute, structData } = this.props;
    const { currentIndex } = this.state;
    return (
      <div>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => this.handleOpenEditModal(index)}
        />
        <Button
          type="link"
          icon={<DeleteOutlined style={{ color: "var(--theme-red-color)" }} />}
          onClick={() => {
            this.openConfirmModal(index);
          }}
        />
        <AddStructModal
          attribute={attribute}
          visible={this.state.showEditModal && currentIndex === index}
          structData={record}
          handleStoreFunction={(formData: any) =>
            this.handleEditStruct(formData, index)
          }
          handleCancelFunction={this.handleCloseModal}
        />
      </div>
    );
  };
  render() {
    const { attribute, isLegacy, structData } = this.props;
    const structDefine = attribute.value.struct_define;
    const columns = this.getColumns(structDefine);
    // 单结构体数据是对象，显示时要转换为数组
    const dataSource = isEmpty(structData)
      ? []
      : isLegacy
      ? [structData]
      : structData;
    return (
      <div style={{ overflowX: "hidden" }}>
        <Table
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size={this.props.size}
        />
      </div>
    );
  }
}
