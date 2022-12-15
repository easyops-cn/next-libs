import React from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Modal, Table, Input } from "antd";
import { Attribute, Structkey } from "./interfaces";
import { isEmpty, isObject, compact, uniq } from "lodash";
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
  showAllStructData: boolean;
  page: number;
  pageSize: number;
  filterDataSource: any;
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
      showAllStructData: false,
      page: 1,
      pageSize: 10,
      filterDataSource: this.getDataSource(),
    };
  }
  getDataSource() {
    return isEmpty(this.props.structData)
      ? []
      : this.props.isLegacy
      ? [this.props.structData]
      : [...this.props.structData];
  }

  getColumns(defines: Structkey[]) {
    const columns: any = defines.map((item: Structkey) => ({
      title: item.name,
      className: styles.structTableTd,
      dataIndex: item.id,
      render: (text: any, _record: any, _index: number) => {
        let copyText: string;
        let showText: string;
        switch (item.type) {
          case "bool":
            return String(text ?? "");
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
        fixed: "right",
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
    const { pageSize, page } = this.state;
    const structNumber = pageSize * (page - 1) + index;
    if (isLegacy) {
      structData = {};
    } else {
      structData.splice(structNumber, 1);
    }
    this.props.handleStoreFunction(structData);
  }
  handleEditStruct = (formData: any, index: number) => {
    let { structData, isLegacy } = this.props;
    const { pageSize, page } = this.state;
    const structNumber = pageSize * (page - 1) + index;
    if (isLegacy) {
      structData = [structData];
    }
    structData[structNumber] = formData;
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

  handlePaginationChange = (page: number, pageSize: number): void => {
    this.setState({
      page,
      pageSize,
    });
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
  closeAllDataModal = () => {
    this.setState({
      showAllStructData: false,
      filterDataSource: this.getDataSource(),
    });
  };
  // istanbul ignore next
  onSearch = (value: string) => {
    let filterDataSource = this.getDataSource();
    if (value) {
      filterDataSource = compact(
        filterDataSource.map((r: any) => {
          const values: string[] = Object.values(r);
          if (values?.find((s: string) => s.toString().match(value))) {
            return r;
          }
        })
      );
    }
    this.setState({
      filterDataSource,
    });
  };
  render() {
    const { attribute, isEditable } = this.props;
    const { showAllStructData } = this.state;
    const structDefine = attribute.value.struct_define;
    const columns = this.getColumns(structDefine);
    // 单结构体数据是对象，显示时要转换为数组
    const dataSource = this.getDataSource();
    const displayDataSource = isEditable ? dataSource : dataSource.slice(0, 10);
    return (
      <div style={{ overflowX: "hidden" }}>
        <Table
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={displayDataSource}
          pagination={
            isEditable && dataSource.length > 10
              ? {
                  showSizeChanger: true,
                  onChange: this.handlePaginationChange,
                }
              : false
          }
          size={this.props.size}
        />
        {!isEditable && dataSource.length > 10 && (
          <Button
            type="link"
            data-testid="view-more"
            onClick={() => {
              this.setState({ showAllStructData: true });
            }}
          >
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW_MORE}`)}
          </Button>
        )}
        <Modal
          data-testid="show-all-modal"
          visible={showAllStructData}
          title={attribute.name}
          width={800}
          zIndex={1035}
          onCancel={this.closeAllDataModal}
          footer={
            <Button type="primary" onClick={this.closeAllDataModal}>
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONFIRM}`)}
            </Button>
          }
          destroyOnClose={true}
        >
          {
            // istanbul ignore next
            <Input.Search
              style={{ marginBottom: 30, width: 300 }}
              onSearch={(value) => {
                // istanbul ignore next
                this.onSearch(value);
              }}
              enterButton
            />
          }
          <Table
            dataSource={this.state.filterDataSource}
            scroll={{ x: "max-content" }}
            columns={columns}
            pagination={{
              showSizeChanger: true,
            }}
          />
        </Modal>
      </div>
    );
  }
}
