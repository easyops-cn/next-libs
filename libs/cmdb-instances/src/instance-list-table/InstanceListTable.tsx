import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import classnames from "classnames";
import { Button, Popover, Table, Tag } from "antd";
import { isNil } from "lodash";
import {
  ColumnProps,
  PaginationConfig,
  SorterResult,
  TableCurrentDataSource,
  TableRowSelection,
  TableProps
} from "antd/lib/table/interface";
import {
  PropertyDisplay,
  PropertyDisplayConfig,
  PropertyDisplayType,
  ReadPaginationChangeDetail,
  ReadSelectionChangeDetail,
  ReadSortingChangeDetail
} from "@easyops/brick-types";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import { Link } from "@libs/basic-components";
import {
  forEachAvailableFields,
  getInstanceNameKeys,
  getTemplateFromMap,
  parseTemplate,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
  RelationObjectSides
} from "@libs/cmdb-utils";
import { NS_CMDB_INSTANCES } from "./i18n/constants";

import { InstanceListPresetConfigs } from "./interfaces";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";
import { Attribute, StructTable } from "../struct-components";
import styles from "./InstanceListTable.module.css";

enum SortOrder {
  Ascend = "ascend",
  Descend = "descend"
}

export interface InstanceListTableProps extends WithTranslation {
  detailUrlTemplates?: Record<string, string>;
  presetConfigs?: InstanceListPresetConfigs;
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  instanceListData: InstanceApi.PostSearchResponseBody;
  sort?: string;
  asc?: boolean;
  propertyDisplayConfigs?: PropertyDisplayConfig[];
  selectDisabled?: boolean;
  autoBreakLine?: boolean;
  sortDisabled?: boolean;
  onClickItem?(
    evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ): void;
  onPaginationChange?(pagination: ReadPaginationChangeDetail): void;
  onSortingChange?(sorting: ReadSortingChangeDetail): void;
  onSelectionChange?(selection: ReadSelectionChangeDetail): void;
  relationLinkDisabled?: boolean;
  paginationDisabled?: boolean;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
  selectedRowKeys?: string[];
  configProps?: TableProps<Record<string, any>>;
}

interface InstanceListTableState {
  list: Record<string, any>[];
  columns?: ColumnProps<Record<string, any>>[];
  pagination: PaginationConfig;
  selectedRowKeys: string[];
}

export class LegacyInstanceListTable extends React.Component<
  InstanceListTableProps,
  InstanceListTableState
> {
  keyDisplayConfigMap: Record<string, PropertyDisplayConfig> = {};

  constructor(props: InstanceListTableProps) {
    super(props);

    if (this.props.propertyDisplayConfigs) {
      this.props.propertyDisplayConfigs.forEach(
        config => (this.keyDisplayConfigMap[config.key] = config)
      );
    }

    const fieldIds = this.props.presetConfigs
      ? this.props.presetConfigs.fieldIds
      : [];
    const sortedColumns = this.getChangeColumns(fieldIds);

    this.state = {
      list: this.props.instanceListData.list,
      columns: sortedColumns,
      pagination: {
        disabled: this.props.paginationDisabled,
        pageSizeOptions: this.props.pageSizeOptions,
        showSizeChanger: this.props.showSizeChanger,
        total: this.props.instanceListData.total,
        showTotal: total =>
          `共 ${total} 项${
            this.state.selectedRowKeys.length > 0
              ? `，已选择 ${this.state.selectedRowKeys.length} 项`
              : ""
          }`,
        current: this.props.instanceListData.page,
        pageSize: this.props.instanceListData.page_size
      },
      selectedRowKeys: this.props.selectedRowKeys || []
    };
  }

  getChangeColumns(ids: string[]) {
    const columns: InstanceListTableState["columns"] = [];
    forEachAvailableFields(
      this.props.modelData,
      attr =>
        columns.push(
          this.setColumnSortOrder(
            this.getAttributeColumnData(attr, this.props.modelData)
          )
        ),
      (relation, sides) =>
        columns.push(
          this.setColumnSortOrder(
            this.getRelationColumnData(relation, this.props.modelData, sides)
          )
        ),
      ids
    );
    const idColumnMap = new Map<string, ColumnProps<Record<string, any>>>();
    columns.forEach(column => idColumnMap.set(column.dataIndex, column));
    let fieldIds: string[];
    if (ids?.length) {
      fieldIds = ids;
    } else if (
      this.props.modelData.view &&
      this.props.modelData.view.attr_order
    ) {
      fieldIds = this.props.modelData.view.attr_order;
    }
    let sortedColumns: InstanceListTableState["columns"];
    if (fieldIds) {
      sortedColumns = [];
      fieldIds.forEach(id => {
        const column = idColumnMap.get(id);
        if (column) {
          sortedColumns.push(column);
          idColumnMap.delete(id);
        }
      });
      idColumnMap.forEach(column => sortedColumns.push(column));
    } else {
      sortedColumns = columns;
    }
    return sortedColumns;
  }

  UNSAFE_componentWillReceiveProps(nextProps: InstanceListTableProps) {
    const columns = this.getChangeColumns(nextProps.presetConfigs.fieldIds);
    this.setState({ columns });
  }

  handleClickItem(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ): void {
    if (this.props.onClickItem) {
      this.props.onClickItem(e, id);
    }
  }

  getCustomPropertyRender(config: PropertyDisplayConfig, isPrimary?: boolean) {
    return (value: any, record: Record<string, any>, index: number) => {
      return (
        <config.brick
          ref={(el: HTMLElement & PropertyDisplay) => {
            if (el) {
              if (config.properties) {
                Object.assign(
                  el,
                  {
                    dataSource: record,
                    objectId: this.props.modelData.objectId
                  },
                  config.properties
                );
              } else {
                Object.assign(el, {
                  key: config.key,
                  value,
                  isPrimary
                });
              }
            }
          }}
        />
      );
    };
  }

  getAttributeColumnData(
    attribute: Partial<CmdbModels.ModelObjectAttr>,
    object: Partial<CmdbModels.ModelCmdbObject>
  ): ColumnProps<Record<string, any>> {
    const column: ColumnProps<Record<string, any>> = {
      title: attribute.name,
      dataIndex: attribute.id,
      className: styles.instanceListTableCell
    };
    const displayConfig = this.keyDisplayConfigMap[attribute.id];
    const isPrimary = attribute.id === getInstanceNameKeys(object)[0];

    switch (attribute.value.type) {
      case ModelAttributeValueType.STRUCT:
      case ModelAttributeValueType.STRUCT_LIST:
        column.sorter = false;
        break;
      default:
        column.sorter = !this.props.sortDisabled;
    }

    if (displayConfig) {
      if (displayConfig.brick) {
        column.render = this.getCustomPropertyRender(displayConfig, isPrimary);
      } else if (displayConfig.type) {
        switch (displayConfig.type) {
          case PropertyDisplayType.Tag:
            column.render = (
              values: string | string[],
              record: Record<string, any>,
              index: number
            ) => {
              if (values) {
                if (!(values instanceof Array)) {
                  values = [values];
                }
                return values.map(value => {
                  let color: string;
                  if (displayConfig.valueColorMap) {
                    color = displayConfig.valueColorMap[value];
                  }
                  return (
                    <Tag key={value} color={color}>
                      {value}
                    </Tag>
                  );
                });
              } else {
                return null;
              }
            };
            break;
        }
      }
    } else {
      let isLegacy: boolean;
      switch (attribute.value.type) {
        case ModelAttributeValueType.STRUCT:
          isLegacy = true;
        // falls through
        case ModelAttributeValueType.STRUCT_LIST:
          column.render = (
            value: Record<string, any> | Record<string, any>[],
            record: Record<string, any>,
            index: number
          ) => {
            return value ? (
              <Popover
                overlayStyle={{ width: 500, height: "auto", overflowY: "auto" }}
                content={
                  <StructTable
                    attribute={attribute as Attribute}
                    structData={value}
                    isLegacy={isLegacy}
                    size="small"
                  />
                }
                placement="bottom"
              >
                <Button type="link">查看</Button>
              </Popover>
            ) : null;
          };
          break;
        case ModelAttributeValueType.ARR:
          column.render = (
            value: string[],
            record: Record<string, any>,
            index: number
          ) => {
            return value && value.length > 0 ? value.join("; ") : null;
          };
          break;
        case ModelAttributeValueType.BOOLEAN:
          column.render = (v: boolean) => (isNil(v) ? "" : "" + v);
          break;
        default:
          if (isPrimary && this.props.detailUrlTemplates) {
            const detailUrlTemplate = getTemplateFromMap(
              this.props.detailUrlTemplates,
              object.objectId
            );
            if (detailUrlTemplate) {
              column.render = (
                text: string,
                record: Record<string, any>,
                index: number
              ) => {
                const data = {
                  ...record,
                  objectId: object.objectId
                };
                const url = parseTemplate(detailUrlTemplate, data);
                return (
                  <Link
                    // 使用 <Link> 以保持链接的原生能力
                    to={url}
                    // 自定义 onClick 以支持事件配置和拦截
                    onClick={e => this.handleClickItem(e, record.instanceId)}
                    data-testid="instance-detail-link"
                  >
                    {text}
                  </Link>
                );
              };
            } else if (detailUrlTemplate === null) {
              column.render = (text: string, record: Record<string, any>) => {
                return (
                  <a
                    role="button"
                    onClick={e => this.handleClickItem(e, record.instanceId)}
                    data-testid="instance-detail-link"
                  >
                    {text}
                  </a>
                );
              };
            }
          }
      }
    }

    return column;
  }

  getRelationColumnData(
    relation: Partial<CmdbModels.ModelObjectRelation>,
    object: Partial<CmdbModels.ModelCmdbObject>,
    sides: RelationObjectSides
  ): ColumnProps<Record<string, any>> {
    const key = relation[`${sides.this}_id` as RelationIdKeys];

    const column: ColumnProps<Record<string, any>> = {
      title: relation[`${sides.this}_name` as RelationNameKeys],
      dataIndex: key,
      sorter: !this.props.sortDisabled,
      className: styles.instanceListTableCell
    };
    const displayConfig = this.keyDisplayConfigMap[key];

    if (displayConfig) {
      column.render = this.getCustomPropertyRender(displayConfig);
    } else {
      column.render = (
        instances: Record<string, any>[],
        record: Record<string, any>,
        index: number
      ) => {
        if (instances && instances.length > 0) {
          const objectId =
            relation[`${sides.that}_object_id` as RelationObjectIdKeys];
          const nameKeys = getInstanceNameKeys(
            this.props.idObjectMap[objectId]
          );
          let detailUrlTemplate: string;

          if (this.props.detailUrlTemplates) {
            detailUrlTemplate = getTemplateFromMap(
              this.props.detailUrlTemplates,
              objectId
            );
          }

          const instanceNodes = instances.map((instance, index) => {
            let subName: string;

            if (nameKeys.length > 1) {
              subName = instance[nameKeys[1]];
            }

            let instanceName = subName
              ? `${instance[nameKeys[0]]} (${subName})`
              : instance[nameKeys[0]];

            if (detailUrlTemplate) {
              const url = parseTemplate(detailUrlTemplate, {
                ...instance,
                objectId
              });
              return (
                <React.Fragment key={instance.instanceId}>
                  {index > 0 && "; "}
                  {this.props.relationLinkDisabled ? (
                    instanceName
                  ) : (
                    <Link
                      // 使用 <Link> 以保持链接的原生能力
                      to={url}
                      // 自定义 onClick 以支持事件配置和拦截
                      onClick={e => this.handleClickItem(e, record.instanceId)}
                    >
                      {instanceName}
                    </Link>
                  )}
                </React.Fragment>
              );
            } else {
              if (index > 0) {
                instanceName = "; " + instanceName;
              }
              return instanceName;
            }
          });

          return instanceNodes;
        } else {
          return null;
        }
      };
    }

    return column;
  }

  setColumnSortOrder<T = any>(column: ColumnProps<T>) {
    if (
      (column.dataIndex !== undefined &&
        column.dataIndex === this.props.sort) ||
      (column.key !== undefined && column.key === this.props.sort)
    ) {
      column.sortOrder = this.props.asc ? SortOrder.Ascend : SortOrder.Descend;
    } else {
      column.sortOrder = false;
    }
    return column;
  }

  onChange = (
    pagination: PaginationConfig,
    filters: Record<string, string[]>,
    sorter: SorterResult<Record<string, any>>,
    extra: TableCurrentDataSource<Record<string, any>>
  ) => {
    if (
      pagination.current !== this.state.pagination.current ||
      pagination.pageSize !== this.state.pagination.pageSize
    ) {
      if (this.props.onPaginationChange) {
        this.props.onPaginationChange({
          page: pagination.current,
          pageSize: pagination.pageSize
        });
      }
    }
    const asc = { [SortOrder.Ascend]: true, [SortOrder.Descend]: false }[
      sorter.order
    ];
    if (sorter.columnKey !== this.props.sort || asc !== this.props.asc) {
      if (this.props.onSortingChange) {
        this.props.onSortingChange({ sort: sorter.columnKey, asc });
      }
    }
  };

  onSelectChange = (
    selectedRowKeys: string[] | number[],
    selectedRows: Record<string, any>[]
  ) => {
    this.setState({ selectedRowKeys: selectedRowKeys as string[] });
    this.props.onSelectionChange?.({
      selectedKeys: selectedRowKeys as string[],
      selectedItems: selectedRows
    });
  };

  componentDidUpdate(prevProps: InstanceListTableProps) {
    if (this.props.instanceListData !== prevProps.instanceListData) {
      this.setState({
        list: this.props.instanceListData.list,
        pagination: {
          total: this.props.instanceListData.total,
          current: this.props.instanceListData.page,
          pageSize: this.props.instanceListData.page_size
        }
      });
    }
    if (
      this.props.sort !== prevProps.sort ||
      this.props.asc !== prevProps.asc
    ) {
      const columns: ColumnProps<Record<string, any>>[] = [];
      this.state.columns.forEach(column =>
        columns.push(this.setColumnSortOrder(column))
      );
      this.setState({ columns });
    }
  }

  render(): React.ReactNode {
    const { selectedRowKeys } = this.state;
    const rowSelection: TableRowSelection<Record<string, any>> = this.props
      .selectDisabled
      ? null
      : {
          selectedRowKeys,
          onChange: this.onSelectChange
        };

    const classes = classnames({
      [styles.shouldEllipsis]: this.props.autoBreakLine,
      [styles.tableWrapper]: true
    });

    return (
      <div
        className={classes}
        style={{ overflowX: "auto", overflowY: "hidden" }}
      >
        <Table
          columns={this.state.columns}
          dataSource={this.props.instanceListData.list}
          rowKey="instanceId"
          scroll={{ x: "max-content" }}
          pagination={this.state.pagination}
          rowSelection={rowSelection}
          onChange={this.onChange}
          {...this.props.configProps}
        />
      </div>
    );
  }
}

export const InstanceListTable = withTranslation(NS_CMDB_INSTANCES)(
  LegacyInstanceListTable
);
