import React from "react";
import { Button, Modal, Table } from "antd";
import { Attribute, Structkey } from "./interfaces";
import { isEmpty } from "lodash";
import { AddStructModal } from "./AddStructModal";
import { TableSize } from "antd/lib/table/interface";
import styles from "./index.module.css";
export interface StructTableProps {
  attribute: Attribute;
  structData: any;
  isEditable?: boolean;
  // 是否单结构体
  isLegacy?: boolean;
  size?: TableSize;
  handleStoreFunction?: Function;
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
      showEditModal: false
    };
  }
  getColumns(defines: Structkey[]) {
    const columns = defines.map((item: Structkey) => ({
      title: item.name,
      className: styles.structTableTd,
      dataIndex: item.id,
      render: (text: string, _record: any, _index: number) =>
        item.type === "bool" ? String(text) : text
    }));
    if (this.props.isEditable) {
      columns.push({
        title: "操作",
        className: styles.structTableTd,
        dataIndex: "operation",
        render: (_text: string, record: any, index: number): any => {
          return this.renderOperation(record, index);
        }
      });
    }
    return columns;
  }
  openConfirmModal(index: number) {
    const confirm = Modal.confirm;

    confirm({
      title: "确定要删除该结构体吗？",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        this.remove(index);
      }
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
      currentIndex: index
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
          icon="edit"
          onClick={() => this.handleOpenEditModal(index)}
        />
        <Button
          type="link"
          icon="delete"
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
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size={this.props.size}
      />
    );
  }
}
