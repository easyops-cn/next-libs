import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import classnames from "classnames";
import {
  Button,
  Popover,
  Table,
  Tag,
  Tooltip,
  Modal,
  message,
  Typography,
} from "antd";
import { isNil, isBoolean, compact, map } from "lodash";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import { ColumnType, TablePaginationConfig, TableProps } from "antd/lib/table";
import {
  SorterResult,
  TableCurrentDataSource,
  TableRowSelection,
} from "antd/lib/table/interface";
import {
  PropertyDisplay,
  PropertyDisplayConfig,
  PropertyDisplayType,
  ReadPaginationChangeDetail,
  ReadSelectionChangeDetail,
  ReadSortingChangeDetail,
  UseBrickConf,
} from "@next-core/brick-types";
import {
  CmdbModels,
  InstanceApi_PostSearchV3ResponseBody,
  CmdbObjectApi_getIdMapName,
  InstanceApi_postSearch,
} from "@next-sdk/cmdb-sdk";
import { http } from "@next-core/brick-http";
import { Link, GeneralIcon } from "@next-libs/basic-components";
import {
  forEachAvailableFields,
  getInstanceNameKeys,
  getTemplateFromMap,
  parseTemplate,
  modifyModelData,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
  RelationObjectSides,
} from "@next-libs/cmdb-utils";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";
import { Attribute, StructTable } from "../struct-components";
import styles from "./InstanceListTable.module.css";
import { customRules } from "./utils";
import { BrickAsComponent, useProvider } from "@next-core/brick-kit";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import i18n from "i18next";
import { CmdbUrlLink } from "../cmdb-url-link/CmdbUrlLink";
import { FloatDisplayBrick } from "../float-display-brick/FloatDisplayBrick";
import { JsonDisplayBrick } from "../json-display-brick/JsonDisplayBrick";
import { XmlDisplayBrick } from "../xml-display-brick/XmlDisplayBrick";
// const { Paragraph } = Typography;
export interface CustomColumn extends ColumnType<Record<string, unknown>> {
  useBrick: UseBrickConf;
}

export type UseBrickAndPropertyDisplayConfig = PropertyDisplayConfig & {
  useBrick?: UseBrickConf;
};

export interface InstanceListUseBrickData {
  cellData: unknown;
  rowData: Record<string, unknown>;
  index: number;
}

enum SortOrder {
  Ascend = "ascend",
  Descend = "descend",
}

const SELF_RENDER_COLUMNS: {
  [objectId: string]: UseBrickAndPropertyDisplayConfig[];
} = {
  HOST: [
    {
      key: "_agentStatus",
      brick: "presentational-bricks.agent-status",
    },
  ],
  CLUSTER: [
    {
      key: "type",
      brick: "presentational-bricks.brick-cluster-type",
      properties: {
        fields: {
          value: "type",
        },
        showBg: true,
      },
    },
  ],
};

export interface InstanceListTableProps extends WithTranslation {
  detailUrlTemplates?: Record<string, string>;
  fieldIds?: string[];
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  instanceListData: InstanceApi_PostSearchV3ResponseBody;
  sort?: string;
  asc?: boolean;
  propertyDisplayConfigs?: UseBrickAndPropertyDisplayConfig[];
  selectDisabled?: boolean;
  autoBreakLine?: boolean;
  sortDisabled?: boolean;
  instanceSourceQuery?: string;
  inheritanceModelIdNameMap?: Record<string, string>;
  filterInstanceSourceDisabled?: boolean;
  onClickItem?(
    evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ): void;
  onClickItemV2?(
    evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    record: Record<string, any>
  ): void;
  onPaginationChange?(pagination: ReadPaginationChangeDetail): void;
  onSortingChange?(sorting: ReadSortingChangeDetail): void;
  onSelectionChange?(selection: ReadSelectionChangeDetail): void;
  onInstanceSourceChange?(instanceSourceQuery: string): void;
  relationLinkDisabled?: boolean;
  paginationDisabled?: boolean;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
  selectedRowKeys?: string[];
  configProps?: TableProps<Record<string, any>>;
  extraColumns?: CustomColumn[];
  isOperate?: boolean;
  handleDeleteFunction?: (v: any[]) => void;
  target?: string;
  ipCopy?: boolean;
  separatorUsedInRelationData?: string;
  showTooltip?: boolean;
  fixedHeader?: boolean;
  rowSelectionType?: "checkbox" | "radio";
  onColumnsChange?(columns: ColumnType<{ dataIndex: string }>[]): void;
  useExternalCmdbApi?: boolean;
  externalSourceId?: string;
  hiddenColumns?: Array<string>;
  showCustomizedSerialNumber?: boolean;
}

interface InstanceListTableState {
  list: Record<string, any>[];
  instanceSourceQuery?: string;
  columns?: ColumnType<Record<string, any>>[];
  pagination: TablePaginationConfig;
  defaultPagination: TablePaginationConfig;
}

export class LegacyInstanceListTable extends React.Component<
  InstanceListTableProps,
  InstanceListTableState
> {
  keyDisplayConfigMap: Record<string, UseBrickAndPropertyDisplayConfig> = {};
  recordUseBrickDataMap: Map<unknown, InstanceListUseBrickData>;
  inheritanceModelIdNameMap: Record<string, string>;
  selectedRows: Record<string, any>[] = [];
  ROM_KEY = "instanceId";

  instanceSourceTitle: React.ReactElement = (
    <>
      <span>{i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.INSTANCE_SOURCE}`)}</span>
      <Tooltip
        title={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.INSTANCE_SOURCE_TOOLTIP}`)}
      >
        <span className={styles.titleTooltipIcon}>
          <GeneralIcon
            icon={{
              lib: "antd",
              icon: "question-circle",
              theme: "filled",
            }}
          />
        </span>
      </Tooltip>
    </>
  );

  constructor(props: InstanceListTableProps) {
    super(props);
    const objectId = this.props.modelData.objectId;
    SELF_RENDER_COLUMNS[objectId]?.forEach(
      (config) => (this.keyDisplayConfigMap[config.key] = config)
    );
    this.props.propertyDisplayConfigs?.forEach(
      (config) => (this.keyDisplayConfigMap[config.key] = config)
    );
    const fieldIds = this.props.fieldIds;

    const showFields = fieldIds?.filter(
      (item) => !this.props.hiddenColumns?.includes(item)
    );
    const sortedColumns = this.getChangeColumns(showFields);
    this.inheritanceModelIdNameMap = this.props.inheritanceModelIdNameMap;

    const defaultPagination = {
      disabled: this.props.paginationDisabled,
      pageSizeOptions: this.props.pageSizeOptions,
      showSizeChanger: this.props.showSizeChanger,
      showTotal: (totals: number) => (
        <span className={styles.totalText}>
          {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.PAGINATION_TOTAL_TEXT}`)}{" "}
          <strong className={styles.total}>{totals}</strong>{" "}
          {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.PAGINATION_TOTAL_UNIT}`)}
        </span>
      ),
    };
    const columns = this.getMergedColumns(
      sortedColumns,
      this.props.extraColumns
    );
    this.props.onColumnsChange?.(
      columns.map(({ dataIndex }) => ({ dataIndex }))
    );
    this.state = {
      list: this.props.instanceListData.list,
      instanceSourceQuery: this.props.instanceSourceQuery,
      columns: columns,
      pagination: {
        ...defaultPagination,
        total: this.props.instanceListData.total,
        current: this.props.instanceListData.page,
        pageSize: this.props.instanceListData.page_size,
      },
      defaultPagination: defaultPagination,
    };
  }
  // istanbul ignore next
  openConfirmModal(index: number) {
    const confirm = Modal.confirm;

    confirm({
      title: i18n.t(
        `${NS_LIBS_CMDB_INSTANCES}:${K.DELETE_INSTANCE_CONFIRM_MSG}`
      ),
      okText: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONFIRM}`),
      okType: "danger",
      cancelText: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CANCEL}`),
      onOk: () => {
        this.remove(index);
      },
    });
  }
  // istanbul ignore next
  remove(index: number) {
    const processList = [...this.props.instanceListData.list];
    processList.splice(index, 1);
    this.props.handleDeleteFunction(processList);
  }
  getChangeColumns(ids: string[]) {
    const columns: InstanceListTableState["columns"] = [];
    forEachAvailableFields(
      modifyModelData(this.props.modelData),
      (attr, firstColumns?: boolean) =>
        columns.push(
          this.setColumnSortOrder(
            this.getAttributeColumnData(
              attr,
              this.props.modelData,
              firstColumns
            )
          )
        ),
      (relation, sides, firstColumns?: boolean) =>
        columns.push(
          this.setColumnSortOrder(
            this.getRelationColumnData(
              relation,
              this.props.modelData,
              sides,
              firstColumns
            )
          )
        ),
      ids
    );
    const idColumnMap = new Map<string, ColumnType<Record<string, any>>>();
    columns.forEach((column) =>
      idColumnMap.set(column.dataIndex as string, column)
    );
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
      fieldIds.forEach((id) => {
        const column = idColumnMap.get(id);
        if (column) {
          sortedColumns.push(column);
          idColumnMap.delete(id);
        }
      });
      idColumnMap.forEach((column) => sortedColumns.push(column));
    } else {
      sortedColumns = columns;
    }
    if (this.props.isOperate) {
      sortedColumns.push({
        title: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.OPERATION}`),
        className: styles.structTableTd,
        dataIndex: "operation",
        fixed: "right",
        render: (_text: string, record: any, index: number): any => {
          return (
            <Button
              data-testid={"button-up-" + index}
              type="link"
              icon={
                <DeleteOutlined style={{ color: "var(--theme-red-color)" }} />
              }
              onClick={() => {
                this.openConfirmModal(index);
              }}
            />
          );
        },
      });
    }
    return sortedColumns;
  }

  getMergedColumns(
    columns: ColumnType<Record<string, any>>[],
    extraColumns: CustomColumn[]
  ): ColumnType<Record<string, any>>[] {
    let mergedColumns = extraColumns
      ? [...columns, ...this.processExtraColumns(extraColumns)]
      : columns;
    if (this.props.modelData.isAbstract) {
      mergedColumns = [
        {
          title: this.instanceSourceTitle,
          dataIndex: "_object_id",
          ...(!this.props.filterInstanceSourceDisabled
            ? {
                filters: map(this.inheritanceModelIdNameMap, (value, key) => ({
                  text: value,
                  value: key,
                })),
                filterMultiple: false,
                filteredValue: this.props.instanceSourceQuery && [
                  this.props.instanceSourceQuery,
                ],
              }
            : {}),
          render: (value, record, index) => (
            <Tag>{this.inheritanceModelIdNameMap?.[value] || value}</Tag>
          ),
        },
        ...mergedColumns.filter((c) => c.dataIndex !== "_object_id"),
      ];
    }
    return mergedColumns;
  }

  processExtraColumns(
    extraColumns: CustomColumn[]
  ): ColumnType<Record<string, any>>[] {
    this.recordUseBrickDataMap = new Map();

    return extraColumns.map((column) => {
      const { useBrick, ...processedColumn } = column;

      if (useBrick) {
        processedColumn.render = (value, record, index) => {
          let data = this.recordUseBrickDataMap.get(record);

          if (!data) {
            data = { cellData: value, rowData: record, index };
            this.recordUseBrickDataMap.set(record, data);
          }

          return <BrickAsComponent useBrick={useBrick} data={data} />;
        };
      }

      return processedColumn;
    });
  }

  async componentDidMount(): Promise<void> {
    if (
      this.props.modelData.isAbstract &&
      isNil(this.inheritanceModelIdNameMap)
    ) {
      // useExternalCmdbApi为true 调用外部接口
      // istanbul ignore if
      if (this.props.useExternalCmdbApi) {
        this.inheritanceModelIdNameMap = (
          (await http.post(
            `api/gateway/easyops.api.cmdb.topo_center.ProxyGetIdMapName@1.0.1/api/v1/proxy-get-id-map-name`,
            {
              parentObjectId: this.props.modelData.objectId,
              sourceId: this.props.externalSourceId,
            }
          )) as any
        ).data;
      } else {
        this.inheritanceModelIdNameMap = await CmdbObjectApi_getIdMapName({
          parentObjectId: this.props.modelData.objectId,
        } as any);
      }
    }
    const showFields = this.props.fieldIds?.filter(
      (item) => !this.props.hiddenColumns?.includes(item)
    );
    const changeColumns = this.getChangeColumns(showFields);
    const columns = this.getMergedColumns(
      changeColumns,
      this.props.extraColumns
    );
    this.setState({
      columns,
    });
    this.props.onColumnsChange?.(
      columns.map(({ dataIndex }) => ({ dataIndex }))
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps: InstanceListTableProps): void {
    this.inheritanceModelIdNameMap = {
      ...this.inheritanceModelIdNameMap,
      ...nextProps.inheritanceModelIdNameMap,
    };
    const showFields = nextProps.fieldIds?.filter(
      (item) => !this.props.hiddenColumns?.includes(item)
    );
    const changeColumns = this.getChangeColumns(showFields);
    const columns = this.getMergedColumns(
      changeColumns,
      nextProps.extraColumns
    );

    this.setState({
      columns,
    });

    this.props.onColumnsChange?.(
      columns.map(({ dataIndex }) => ({ dataIndex }))
    );
  }
  handleClickItem(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    record: Record<string, any>
  ): void {
    if (this.props.onClickItem) {
      this.props.onClickItem(e, record.instanceId);
    }
    if (this.props.onClickItemV2) {
      this.props.onClickItemV2(e, record);
    }
  }
  getCustomPropertyRender(
    config: UseBrickAndPropertyDisplayConfig,
    isPrimary?: boolean
  ) {
    // eslint-disable-next-line react/display-name
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
                    objectId: this.props.modelData.objectId,
                  },
                  config.properties
                );
              } else {
                Object.assign(el, {
                  key: config.key,
                  value,
                  isPrimary,
                });
              }
            }
          }}
        />
      );
    };
  }
  getDisplayConfigColumn(
    config: UseBrickAndPropertyDisplayConfig,
    isPrimary?: boolean
  ) {
    return (value: string[], record: Record<string, any>, index: number) => {
      if (config.brick) {
        return this.getCustomPropertyRender(config, isPrimary)(
          value,
          record,
          index
        );
      } else if (config.useBrick) {
        return this.getUseBrickConfigRender(config)(value, record, index);
      }
    };
  }
  getUseBrickConfigRender(config: UseBrickAndPropertyDisplayConfig) {
    // eslint-disable-next-line react/display-name
    return (value: any, record: Record<string, any>, index: number) => {
      const data = { cellData: value, rowData: record, index };
      return <BrickAsComponent useBrick={config.useBrick} data={data} />;
    };
  }

  getLinkContent(node: any) {
    return (
      <span style={{ display: "flex" }}>
        <span className={styles.iconWrap}>
          <GeneralIcon
            icon={{
              lib: "easyops",
              icon: "search",
              category: "app",
              color: "#167be0",
            }}
          />
        </span>
        <span className={styles.linkKey}>{node}</span>
      </span>
    );
  }
  // istanbul ignore next
  getSpecialUrlTemplates(
    object: Partial<CmdbModels.ModelCmdbObject>,
    record: any,
    node: any,
    url?: string,
    isRenderStructList?: boolean
  ) {
    if (!url) {
      return (
        <a
          role="button"
          onClick={(e) => this.handleClickItem(e, record)}
          data-testid="instance-detail-link"
        >
          {this.props.showTooltip ? (
            <Tooltip
              placement="top"
              title={`${i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.JUMP_TO}`)}${
                object.name
              }${i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.INSTANCE_DETAIL}`)}`}
            >
              {this.getLinkContent(node)}
            </Tooltip>
          ) : (
            this.getLinkContent(node)
          )}
        </a>
      );
    }
    return (
      <>
        <span style={{ display: "flex" }}>
          <span
            className={
              isRenderStructList ? styles.iconWrapOfStruct : styles.iconWrap
            }
          >
            <Link
              to={url}
              onClick={(e: MouseEvent | React.MouseEvent) =>
                this.handleClickItem(
                  e as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
                  record
                )
              }
              data-testid="instance-detail-link"
            >
              <Tooltip
                placement="top"
                title={`${i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.JUMP_TO}`)}${
                  object.name
                }${i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.INSTANCE_DETAIL}`)}`}
              >
                <span>
                  <GeneralIcon
                    icon={{
                      lib: "easyops",
                      icon: "search",
                      category: "app",
                      color: "#167be0",
                    }}
                  />
                </span>
              </Tooltip>
            </Link>
          </span>
          <span className={styles.linkKey}>{node}</span>
        </span>
      </>
    );
  }
  getAttributeColumnData(
    attribute: Partial<CmdbModels.ModelObjectAttr>,
    object: Partial<CmdbModels.ModelCmdbObject>,
    firstColumns?: boolean
  ): ColumnType<Record<string, any>> {
    const column: ColumnType<Record<string, any>> = {
      title: attribute.name,
      dataIndex: attribute.id,
      className: styles.instanceListTableCell,
    };
    const displayConfig = this.keyDisplayConfigMap[attribute.id];
    const isPrimary = attribute.id === getInstanceNameKeys(object)[0];
    let tempColumns: any;
    const attrValueType: any = attribute.value.type;
    switch (attrValueType) {
      case ModelAttributeValueType.STRUCT:
      case ModelAttributeValueType.ATTACHMENT:
      case ModelAttributeValueType.STRUCT_LIST:
        column.sorter = false;
        break;
      default:
        column.sorter = !this.props.sortDisabled;
    }
    if (displayConfig) {
      if (displayConfig.brick || displayConfig.useBrick) {
        tempColumns = this.getDisplayConfigColumn(displayConfig, isPrimary);
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
                return values.map((value) => {
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
      const attrValueType: any = attribute.value.type;
      switch (attrValueType) {
        case ModelAttributeValueType.STRUCT:
          isLegacy = true;
        // falls through
        case ModelAttributeValueType.ATTACHMENT:
        case ModelAttributeValueType.STRUCT_LIST:
          tempColumns = (
            value: Record<string, any> | Record<string, any>[],
            record: Record<string, any>,
            index: number
          ) => {
            return value ? (
              <Popover
                overlayStyle={{ maxWidth: 800, width: "100%", height: "auto" }}
                content={
                  <StructTable
                    attribute={attribute as Attribute}
                    structData={value}
                    isLegacy={isLegacy}
                  />
                }
                placement="bottom"
              >
                <Button type="link" style={{ padding: "4px 0" }}>
                  {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW}`)}
                </Button>
              </Popover>
            ) : null;
          };
          break;
        case ModelAttributeValueType.ARR:
        case ModelAttributeValueType.ENUMS:
          tempColumns = (
            value: string[],
            record: Record<string, any>,
            index: number
          ) => {
            return value && value.length > 0 ? value.join("; ") : null;
          };
          break;
        case ModelAttributeValueType.BOOLEAN:
          tempColumns = (v: boolean) => (isNil(v) ? "" : "" + v);
          break;
        case ModelAttributeValueType.JSON:
          tempColumns = (value: any) => {
            return (
              <JsonDisplayBrick
                value={value}
                name={attribute.name}
                isNumControlEllipsis={false}
              />
            );
          };
          break;
        case ModelAttributeValueType.STRING:
          switch (attribute.value.mode as any) {
            case "xml": {
              tempColumns = (v: string) => {
                return (
                  <XmlDisplayBrick value={v} isNumControlEllipsis={false} />
                );
              };
              break;
            }
            case "password": {
              tempColumns = (v: string) => {
                return "*".repeat(v?.length);
              };
              break;
            }
            default: {
              tempColumns = (v: string) => v;
            }
          }
          break;
        case ModelAttributeValueType.FLOAT:
          tempColumns = (value: number) => {
            return <FloatDisplayBrick floatValue={value} />;
          };
          break;
        default:
          if (object.objectId === "HOST" && attribute.id in customRules) {
            tempColumns = (
              text: any,
              record: Record<string, any>,
              index: number
            ) => {
              if (!isBoolean(text) && (text || text === 0)) {
                text = compact(text.toString().split(" "));
                const valStr = text
                  .map((item: any) => {
                    return (customRules as any)[attribute.id](item, attribute);
                  })
                  .join(" ");
                return valStr === "" ? undefined : valStr;
              }
              return (customRules as any)[attribute.id](text, attribute);
            };
          } else {
            tempColumns = (v: string) => v;
          }
      }
    }
    // istanbul ignore next
    if (tempColumns) {
      column.render =
        firstColumns && this.props.detailUrlTemplates
          ? (value: string, record: Record<string, any>, index: number) => {
              //要跳到的路由
              const detailUrlTemplate = getTemplateFromMap(
                this.props.detailUrlTemplates,
                object.objectId
              );
              if (detailUrlTemplate) {
                const data = {
                  ...record,
                  objectId: object.isAbstract
                    ? record._object_id
                    : object.objectId,
                };
                const url = parseTemplate(detailUrlTemplate, data);
                if (
                  attribute.value.type === ModelAttributeValueType.STRUCT ||
                  attribute.value.type === ModelAttributeValueType.STRUCT_LIST
                ) {
                  return this.getSpecialUrlTemplates(
                    object,
                    record,
                    tempColumns(value, record, index),
                    url,
                    true
                  );
                }
                if (displayConfig && displayConfig.brick) {
                  return this.getSpecialUrlTemplates(
                    object,
                    record,
                    tempColumns(value, record, index),
                    url
                  );
                }
                return (
                  <Link
                    to={url}
                    onClick={(e: MouseEvent | React.MouseEvent) =>
                      this.handleClickItem(
                        e as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
                        record
                      )
                    }
                    data-testid="instance-detail-link"
                    {...(!firstColumns || object.isAbstract
                      ? { target: "_blank" }
                      : this.props.target
                      ? { target: this.props.target }
                      : {})}
                  >
                    {this.props.showTooltip ? (
                      <Tooltip
                        placement="top"
                        title={`${i18n.t(
                          `${NS_LIBS_CMDB_INSTANCES}:${K.JUMP_TO}`
                        )}${
                          object.isAbstract
                            ? this.inheritanceModelIdNameMap?.[
                                record._object_id
                              ] || record._object_id
                            : object.name
                        }${i18n.t(
                          `${NS_LIBS_CMDB_INSTANCES}:${K.INSTANCE_DETAIL}`
                        )}`}
                      >
                        <span>
                          <span className={styles.iconWrap}>
                            <GeneralIcon
                              icon={{
                                lib: "easyops",
                                icon: "search",
                                category: "app",
                                color: "#167be0",
                              }}
                            />
                          </span>
                          <span className={styles.linkKey}>
                            {tempColumns(value, record, index)}
                          </span>
                        </span>
                      </Tooltip>
                    ) : (
                      <span>
                        <span className={styles.iconWrap}>
                          <GeneralIcon
                            icon={{
                              lib: "easyops",
                              icon: "search",
                              category: "app",
                              color: "#167be0",
                            }}
                          />
                        </span>
                        <span className={styles.linkKey}>
                          {tempColumns(value, record, index)}
                        </span>
                      </span>
                    )}
                  </Link>
                );
              } else {
                return this.getSpecialUrlTemplates(
                  object,
                  record,
                  tempColumns(value, record, index)
                );
              }
            }
          : tempColumns;
    }
    return column;
  }

  getRelationColumnData(
    relation: Partial<CmdbModels.ModelObjectRelation>,
    object: Partial<CmdbModels.ModelCmdbObject>,
    sides: RelationObjectSides,
    firstColumns?: boolean
  ): ColumnType<Record<string, any>> {
    const key = relation[`${sides.this}_id` as RelationIdKeys];

    const column: ColumnType<Record<string, any>> = {
      title: relation[`${sides.this}_name` as RelationNameKeys],
      dataIndex: key,
      sorter: !this.props.sortDisabled,
      className: styles.instanceListTableCell,
    };
    const displayConfig = this.keyDisplayConfigMap[key];
    let tempColumns: any;

    if (displayConfig) {
      tempColumns = this.getDisplayConfigColumn(displayConfig);
    } else {
      tempColumns = (
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
                objectId,
              });
              return (
                <React.Fragment key={instance.instanceId}>
                  {index > 0 &&
                    (this.props.separatorUsedInRelationData ?? "; ")}
                  {this.props.relationLinkDisabled ? (
                    instanceName
                  ) : (
                    <Link
                      target={"_blank"}
                      // 使用 <Link> 以保持链接的原生能力
                      to={url}
                      // 自定义 onClick 以支持事件配置和拦截
                      onClick={(e: MouseEvent | React.MouseEvent) =>
                        this.handleClickItem(
                          e as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
                          record
                        )
                      }
                    >
                      {instanceName}
                    </Link>
                  )}
                </React.Fragment>
              );
            } else {
              if (index > 0) {
                instanceName =
                  (this.props.separatorUsedInRelationData ?? "; ") +
                  instanceName;
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
    // istanbul ignore next
    if (tempColumns) {
      column.render =
        firstColumns && this.props.detailUrlTemplates
          ? (value: string, record: Record<string, any>, index: number) => {
              //要跳到的路由
              const detailUrlTemplate = getTemplateFromMap(
                this.props.detailUrlTemplates,
                object.objectId
              );
              if (detailUrlTemplate) {
                const data = {
                  ...record,
                  objectId: object.objectId,
                };
                const url = parseTemplate(detailUrlTemplate, data);
                return this.getSpecialUrlTemplates(
                  object,
                  record,
                  tempColumns(value, record, index),
                  url
                );
              } else {
                return this.getSpecialUrlTemplates(
                  object,
                  record,
                  tempColumns(value, record, index)
                );
              }
            }
          : tempColumns;
    }
    return column;
  }

  setColumnSortOrder<T = any>(column: ColumnType<T>) {
    if (
      (column.dataIndex !== undefined &&
        column.dataIndex === this.props.sort) ||
      (column.key !== undefined && column.key === this.props.sort)
    ) {
      column.sortOrder = this.props.asc ? SortOrder.Ascend : SortOrder.Descend;
    } else {
      column.sortOrder = null;
    }
    return column;
  }

  onChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, (React.Key | boolean)[]>,
    sorter:
      | SorterResult<Record<string, any>>
      | SorterResult<Record<string, any>>[],
    extra: TableCurrentDataSource<Record<string, any>>
  ) => {
    const newInstanceSourceQuery = filters?._object_id?.[0] as string;
    if (newInstanceSourceQuery !== this.state.instanceSourceQuery) {
      this.props.onInstanceSourceChange(newInstanceSourceQuery);
    }
    if (
      // pagination.current will pass in 0 when total is 0 and sorter has changed
      (pagination.current > 0 &&
        pagination.current !== this.state.pagination.current) ||
      pagination.pageSize !== this.state.pagination.pageSize
    ) {
      this.props.onPaginationChange?.({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
    }
    if (!Array.isArray(sorter)) {
      const asc = { [SortOrder.Ascend]: true, [SortOrder.Descend]: false }[
        sorter.order
      ];
      if (
        (sorter.column ? sorter.field : undefined) !== this.props.sort ||
        asc !== this.props.asc
      ) {
        this.props.onSortingChange?.({ sort: sorter.field as string, asc });
      }
    }
  };

  onSelectChange = (
    selectedRowKeys: (string | number)[],
    selectedRows: Record<string, any>[]
  ) => {
    this.selectedRows = selectedRows;
    this.props.onSelectionChange?.({
      selectedKeys: selectedRowKeys as string[],
      selectedItems: selectedRows,
    });
  };
  handelIpCopyText = async (
    ev: React.MouseEvent<HTMLElement, MouseEvent>,
    dataIndex: string
  ) => {
    ev.stopPropagation();
    let selectedRowKeys = this.props.selectedRowKeys;
    let selectedRows = this.selectedRows.filter((v) => v);
    const objectId = this.props.modelData.objectId;
    if (selectedRowKeys?.length < 1) {
      message.warning(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SELECT_COPY_DATA}`)
      );
      return false;
    }
    selectedRowKeys = selectedRowKeys.filter((k) =>
      selectedRows.every((row) => row[this.ROM_KEY] !== k)
    );
    if (selectedRowKeys.length > 0) {
      let resp: any;
      const params = {
        query: {
          instanceId: {
            $in: selectedRowKeys,
          },
        },
        page_size: selectedRowKeys.length,
        page: 1,
        ...(this.props.useExternalCmdbApi
          ? {
              objectId,
              sourceId: this.props.externalSourceId,
              ignore_missing_field_error: true,
            }
          : {}),
      };
      // useExternalCmdbApi为true 调用外部接口
      if (this.props.useExternalCmdbApi) {
        resp = await http.post(
          "api/gateway/easyops.api.cmdb.topo_center.ProxyPostSearchV3@1.0.1/api/v1/proxy-post-search-v3",
          params
        );
      } else {
        resp = await InstanceApi_postSearch(objectId, params);
      }
      selectedRows = [...selectedRows, ...(resp?.list || [])];
    }
    const inputDom = document.createElement("textarea");
    inputDom.value = [
      ...new Set(
        map(
          selectedRows.filter((v) => v[dataIndex]),
          dataIndex
        )
      ),
    ].join("\n");
    document.body.appendChild(inputDom);
    inputDom.select(); //选择对象
    document.execCommand("copy");
    inputDom.remove();
    message.success(i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.COPY_SUCCESS}`));
  };
  componentDidUpdate(prevProps: InstanceListTableProps) {
    if (this.props.instanceListData !== prevProps.instanceListData) {
      this.setState({
        list: this.props.instanceListData.list,
        pagination: {
          ...this.state.defaultPagination,
          total: this.props.instanceListData.total,
          current: this.props.instanceListData.page,
          pageSize: this.props.instanceListData.page_size,
        },
      });
    }
    if (
      this.props.sort !== prevProps.sort ||
      this.props.asc !== prevProps.asc
    ) {
      const columns: ColumnType<Record<string, any>>[] = [];
      this.state.columns.forEach((column) =>
        columns.push(this.setColumnSortOrder(column))
      );
      this.setState({ columns });
      this.props.onColumnsChange?.(
        columns.map(({ dataIndex }) => ({ dataIndex }))
      );
    }
    if (this.props.instanceSourceQuery !== prevProps.instanceSourceQuery) {
      this.setState({
        instanceSourceQuery: this.props.instanceSourceQuery,
      });
    }
  }

  render(): React.ReactNode {
    const { selectedRowKeys, rowSelectionType } = this.props;
    const rowSelection: TableRowSelection<Record<string, any>> = this.props
      .selectDisabled
      ? null
      : {
          type: rowSelectionType,
          preserveSelectedRowKeys: true,
          selectedRowKeys,
          onChange: this.onSelectChange,
        };

    const classes = classnames({
      [styles.shouldEllipsis]: this.props.autoBreakLine,
      [styles.tableWrapper]: true,
    });
    this.state.columns.map((column) => {
      const dataIndex = column.dataIndex as string;
      // istanbul ignore next
      if (
        this.props.modelData.attrList.find((attr) => attr.id === dataIndex)
          ?.value?.mode === "url"
      ) {
        column.render = (text, row, index) => CmdbUrlLink({ linkStr: text });
      }
      if (
        this.props.ipCopy &&
        this.props.modelData.attrList.find((attr) => attr.id === dataIndex)
          ?.value?.type === "ip"
      ) {
        column.filterDropdown = () => <div></div>;
        column.filterIcon = () => (
          <Tooltip
            className={styles.copyWrap}
            title={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.COPY_SELECTED_IP}`)}
          >
            <CopyOutlined
              style={{ fontSize: 16 }}
              onClick={(ev) => this.handelIpCopyText(ev, dataIndex)}
            />
          </Tooltip>
        );
      }
    });
    return (
      <div
        className={classes}
        style={{ overflowX: "auto", overflowY: "hidden" }}
      >
        <Table
          columns={
            this.props.showCustomizedSerialNumber
              ? [
                  {
                    dataIndex: "customizedSerialNumber",
                    title: "序号",
                    align: "center",
                  },
                  ...this.state.columns,
                ]
              : this.state.columns
          }
          dataSource={
            this.props.showCustomizedSerialNumber
              ? this.props.instanceListData.list.map((item, index) => ({
                  ...item,
                  customizedSerialNumber: index + 1,
                }))
              : this.props.instanceListData.list
          }
          rowKey={this.ROM_KEY}
          scroll={{
            x: this.props.fixedHeader
              ? (this.state.columns?.length ?? 0) * 150
              : "max-content",
            y: this.props.fixedHeader ? 560 : null,
          }}
          pagination={this.state.pagination}
          rowSelection={rowSelection}
          onChange={this.onChange}
          expandable={{
            // ant的table数据中有children字段时会自动展示为树形表格，导致模型设置了id为children的字段或者关系字段时会出现报错或者不必要的展开样式
            // rowExpandable在dataSource含children属性时不生效，见https://github.com/ant-design/ant-design/issues/30444
            // 故这里将默认展开的字段设置为不符合模型属性id校验的值
            childrenColumnName: "0",
          }}
          {...this.props.configProps}
        />
      </div>
    );
  }
}
// 临时做法 用HOC来间接声明契约，支持契约被扫描到
export const withProviderDeclare = (Component: any) => {
  // eslint-disable-next-line react/display-name
  return (props: any) => {
    const externalPostSearchV3 = useProvider(
      "easyops.api.cmdb.topo_center@ProxyPostSearchV3:1.0.1",
      { cache: false }
    );
    const externalGetIdMapName = useProvider(
      "easyops.api.cmdb.topo_center@ProxyGetIdMapName:1.0.1",
      { cache: false }
    );
    return <Component {...props} />;
  };
};

export const InstanceListTable = React.memo(
  withTranslation(NS_LIBS_CMDB_INSTANCES)(
    withProviderDeclare(LegacyInstanceListTable)
  )
);
