import React from "react";
import {
  DownOutlined,
  InfoCircleFilled,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  Card,
  Popover,
  Spin,
  Button,
  Menu,
  Dropdown,
  Tooltip,
  Modal,
  Anchor,
  Input,
} from "antd";
import { withTranslation, WithTranslation } from "react-i18next";
import marked from "marked";
import DOMPurify from "dompurify";
import {
  get,
  keyBy,
  mapValues,
  isObject,
  isString,
  cloneDeep,
  map,
  compact,
  flatten,
  uniq,
} from "lodash";
import {
  handleHttpError,
  BrickAsComponent,
  getHistory,
} from "@next-core/brick-kit";
import {
  AttributeConfig,
  CustomBrickConfig,
  CustomDisplay,
  InstanceDisplay,
  BrickAction,
} from "@next-core/brick-types";
import { InstanceRelationTableShow } from "./components/instance-relation-table-show/instance-relation-table-show";
import {
  getInstanceNameKeys,
  modifyModelData,
  IGNORED_FIELDS,
  ModifiedModelCmdbObject,
  ModifiedModelObjectField,
} from "@next-libs/cmdb-utils";
import {
  CmdbModels,
  InstanceApi_PostSearchV3RequestBody,
} from "@next-sdk/cmdb-sdk";
import { Link } from "@next-libs/basic-components";
import { StructTable } from "../struct-components/StructTable";
import { FieldsByTag } from "../model-attribute-form/ModelAttributeForm";
import { InstanceFormat } from "../components";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import style from "./index.module.css";
import shared from "./shared.module.css";

import {
  fetchCmdbObjectRef,
  fetchCmdbInstanceDetail,
  fetchCmdbInstanceDetailByFields,
  fetchCmdbInstanceSearch,
} from "../data-providers";
import {
  DEFAULT_ATTRIBUTE_TAG_STR,
  BASIC_INFORMATION_RELATION_GROUP_ID,
  DEFAULT_ATTRIBUTE_TAG,
  BASIC_INFO,
} from "./constants";
import { isArray } from "util";
import { UseBrickConf } from "@next-core/brick-types";
import { CmdbUrlLink } from "../cmdb-url-link/CmdbUrlLink";
import { FloatDisplayBrick } from "../float-display-brick/FloatDisplayBrick";
import { getQuery } from "../instance-list/InstanceList";

export interface AttrCustomConfigs {
  [attrId: string]: LegacyCustomComponent;
}

export interface LegacyCustomComponent {
  component?: {
    brick: string;
    field?: string;
    properties: Record<string, any>;
  };
  useBrick?: UseBrickConf;
}

export function attrFilter(
  field: ModifiedModelObjectField,
  modelData: Partial<ModifiedModelCmdbObject>
): boolean {
  if (IGNORED_FIELDS[modelData.objectId]?.includes(field.__id)) {
    return false;
  }
  return (
    //非关系、left_groups包含basic_info、有left_tags且在分类中
    !field.__isRelation ||
    (field.__isRelation &&
      (field as CmdbModels.ModelObjectRelation).left_groups?.includes(
        BASIC_INFORMATION_RELATION_GROUP_ID
      )) ||
    modelData.view.attr_category_order.includes(
      (field as CmdbModels.ModelObjectRelation).left_tags[0]
    )
  );
}
export function getRelationShowKeys(
  attrIdList: string[],
  defaultAttrs: Record<string, string[]>
): string[] {
  /* 关系默认视图设置,结构是{关系id: [attr1, attr2, relation1,...]},其中为了区分关系，在关系id前加#
    view: {
      relation_default_attr: {
        USER: [
          'nickname',
          'name',
          '#developApp',
          '#ownApp'
        ]
      }
    }
    在获取实例详情时，如果不额外指定，只能拿到关系对端实例的属性，比如主机的负责人，只能拿到负责人的name等基本属性。
    若要拿到负责人开发的应用，则需要在fields加上USER.developApp
  */
  const relationKey = Object.keys(defaultAttrs);
  relationKey.forEach((key) => {
    const relationFields = defaultAttrs[key].filter((item: string) =>
      item.startsWith("#")
    );
    if (relationFields?.length) {
      attrIdList.push(
        ...relationFields.map((field: string) => `${key}.${field.slice(1)}`)
      );
    }
  });
  return attrIdList;
}
interface LegacyInstanceDetailProps extends WithTranslation {
  modelDataList?: CmdbModels.ModelCmdbObject[];
  objectId: string;
  instanceId: string;
  attributeKeys?: string[];
  attributeConfigs?: Record<string, AttributeConfig>;
  brickConfigList?: CustomBrickConfig[];
  actions?: BrickAction[];
  attrCustomConfigs?: AttrCustomConfigs;
  onActionClick?: (eventName: string) => void;
  fieldsByTag?: FieldsByTag[];
  showCard?: boolean;
  relationFieldUrlTemplate?: string;
  isRelationInstanceDetail?: boolean;
  showFields?: boolean;
  anchorOffset?: number;
  useAnchor?: boolean;
}

interface LegacyInstanceDetailState {
  modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject };
  modelData: Partial<ModifiedModelCmdbObject>;
  instanceData: any;
  helpTips: any[];
  basicInfoGroupList: any[];
  basicInfoGroupListShow: any[];
  formattedInstanceData: any;
  loaded: boolean;
  buttonActions?: BrickAction[];
  dropdownActions?: BrickAction[];
  currentAttr?: any;
  instanceRelationModalData?: any;
  initOffset?: number;
  relationTablePagination?: {
    current?: number;
    pageSize?: number;
  };
  searchValue?: string;
}
function getHref(hash: string) {
  const isHash = (hash || "").startsWith("#");
  if (!isHash) {
    return hash;
  }
  const history = getHistory();
  return history.createHref({
    ...history.location,
    hash,
  });
}
export class LegacyInstanceDetail extends React.Component<
  LegacyInstanceDetailProps,
  LegacyInstanceDetailState
> {
  constructor(props: LegacyInstanceDetailProps) {
    super(props);

    this.state = {
      modelDataMap: null,
      modelData: null,
      instanceData: null,
      helpTips: [
        {
          value: "creator",
          label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATOR}`),
        },
        {
          value: "ctime",
          label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATION_TIME}`),
        },
        {
          value: "modifier",
          label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MODIFIER}`),
        },
        {
          value: "mtime",
          label: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.LAST_MODIFICATION_TIME}`
          ),
        },
      ],
      basicInfoGroupList: [],
      basicInfoGroupListShow: [],
      formattedInstanceData: null,
      loaded: false,
      currentAttr: null,
      instanceRelationModalData: null,
      initOffset: 0,
      relationTablePagination: {
        current: 1,
        pageSize: 10,
      },
      searchValue: "",
    };
  }

  render(): React.ReactNode {
    const { loaded, currentAttr, instanceRelationModalData } = this.state;
    const { showCard = true } = this.props;

    return (
      // React Fragments
      <Spin spinning={!loaded}>
        {loaded && (
          <>
            {showCard ? (
              <Card
                bordered={false}
                title={this.getCardTitle()}
                extra={this.getCardExtra()}
              >
                {this.getCardContent()}
              </Card>
            ) : (
              this.getCardContent()
            )}
            <Modal
              width={850}
              title={
                currentAttr?.right_description ||
                i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW_MORE}`)
              }
              visible={!!currentAttr}
              onCancel={() => {
                this.setState({
                  currentAttr: null,
                  relationTablePagination: {
                    current: 1,
                    pageSize: 10,
                  },
                  searchValue: "",
                });
              }}
              onOk={() => {
                this.setState({
                  currentAttr: null,
                  relationTablePagination: {
                    current: 1,
                    pageSize: 10,
                  },
                  searchValue: "",
                });
              }}
              destroyOnClose={true}
            >
              <div style={{ overflowX: "hidden" }}>
                {
                  // istanbul ignore next
                  <Input.Search
                    style={{ marginBottom: 16, width: 300 }}
                    onSearch={(value) => {
                      this.searchInstanceRelationData(
                        1,
                        this.state.relationTablePagination.pageSize,
                        this.state.currentAttr,
                        value
                      );
                    }}
                    enterButton
                  />
                }
                <InstanceRelationTableShow
                  modelDataMap={this.state.modelDataMap}
                  relationData={currentAttr}
                  value={
                    instanceRelationModalData
                      ? instanceRelationModalData?.list || []
                      : []
                  }
                  relationTablePagination={this.state.relationTablePagination}
                  relationFieldUrlTemplate={this.props.relationFieldUrlTemplate}
                  isPagination={true}
                  total={instanceRelationModalData?.total || 0}
                  paginationChange={(page, pageSize, relationData) =>
                    this.searchInstanceRelationData(
                      page,
                      pageSize,
                      relationData
                    )
                  }
                />
              </div>
            </Modal>
            {this.props.brickConfigList?.map((config) => (
              <Card
                bordered={false}
                title={config.label}
                key={config.name}
                style={{ marginTop: "24px" }}
              >
                <config.name
                  ref={(
                    el: HTMLElement &
                      CustomDisplay &
                      InstanceDisplay<Partial<CmdbModels.ModelCmdbObject>>
                  ) => {
                    // istanbul ignore next
                    if (el) {
                      el.value = this.state.instanceData;
                      el.object = this.state.modelData;
                      el.options = config.options;
                    }
                  }}
                />
              </Card>
            ))}
          </>
        )}
      </Spin>
    );
  }

  // TODO:
  // setFormattedInstanceData(state: LegacyInstanceDetailState): void {
  //   const { modelData, instanceData } = state;
  //   const baseAttrList = modelData.attrList.filter(
  //     attr => !["FK", "FKs"].includes(attr.value.type)
  //   );

  //   this.setState({
  //     formattedInstanceData: baseAttrList.reduce((acc, attr) => {
  //       acc[attr.id] = cmdbFieldValueFormat(
  //         instanceData[attr.id],
  //         attr,
  //         modelData.objectId
  //       );
  //       return acc;
  //     }, {})
  //   });
  // }

  getCardTitle(): React.ReactNode {
    const { instanceData, helpTips } = this.state;
    return (
      <>
        {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.BASIC_INFORMATION}`)}
        <Popover
          placement="bottom"
          content={
            instanceData &&
            helpTips.map((item) => (
              <div className={style.tipInfoItem} key={item}>
                <span className={style.tipInfoKey}>{item.label}:</span>
                <span className={style.tipInfoValue}>
                  {instanceData[item.value]}
                </span>
              </div>
            ))
          }
        >
          <InfoCircleFilled
            className={style.colorBlue}
            style={{ marginLeft: "6px" }}
          />
        </Popover>
      </>
    );
  }

  // istanbul ignore next
  onActionClick(eventName: string) {
    if (this.props.onActionClick) {
      this.props.onActionClick(eventName);
    }
  }

  getCardExtra() {
    const { buttonActions, dropdownActions } = this.state;
    let menu: JSX.Element;

    if (dropdownActions && dropdownActions.length > 0) {
      menu = (
        <Menu>
          {dropdownActions.map((action, index) => {
            if (action.url) {
              return (
                <Menu.Item key={`menu-action-${index}`}>
                  <Link to={action.url}>
                    <span className={action.isDanger ? style.danger : ""}>
                      {action.label}
                    </span>
                  </Link>
                </Menu.Item>
              );
            } else if (action.event) {
              return (
                <Menu.Item
                  key={`menu-action-${index}`}
                  onClick={(e) => this.onActionClick(action.event)}
                >
                  <span className={action.isDanger ? style.danger : ""}>
                    {action.label}
                  </span>
                </Menu.Item>
              );
            }
          })}
        </Menu>
      );
    }

    return (
      <div className={style.instanceDetailActions}>
        {buttonActions &&
          buttonActions.map((action, index) => {
            if (action.url) {
              return (
                <Button key={`button-action-${index}`}>
                  <Link to={action.url}>{action.label}</Link>
                </Button>
              );
            } else if (action.event) {
              return (
                <Button
                  key={`button-action-${index}`}
                  onClick={(e) => this.onActionClick(action.event)}
                >
                  {action.label}
                </Button>
              );
            }
          })}
        {menu && (
          <Dropdown overlay={menu}>
            <a>
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MORE}`)} <DownOutlined />
            </a>
          </Dropdown>
        )}
      </div>
    );
  }
  // istanbul ignore next (Temporarily ignored)
  scrollToTarget() {
    const target = document.getElementById(location.hash.slice(1));
    // istanbul ignore next (Temporarily ignored)
    const initOffset =
      (document.getElementById("basic-group-0")?.offsetTop ?? 0) +
        this.props.anchorOffset ?? 0 + 30;
    this.setState({ initOffset });
    if (target) {
      setTimeout(() => {
        window.scrollTo({
          top: target.offsetTop + initOffset + 65,
        });
      });
    }
  }

  getCardContent(): React.ReactNode {
    const { basicInfoGroupList, basicInfoGroupListShow } = this.state;
    const { useAnchor } = this.props;
    const { Link } = Anchor;
    return (
      <div className={`${style.detailCard} ${shared.showMultipleLines}`}>
        {basicInfoGroupList.length > 1 &&
          (useAnchor ? (
            <Anchor
              affix={true}
              offsetTop={this.state.initOffset}
              className={style.anchorWrapper}
            >
              <div className={style.anchorContainer}>
                <div className={style.anchorLinkContainer}>
                  {basicInfoGroupList.map((basicInfoGroup, index) => (
                    <Link
                      key={`basic-group-${index}`}
                      href={getHref(`#basic-group-${index}`)}
                      title={basicInfoGroup.name}
                    ></Link>
                  ))}
                </div>
              </div>
            </Anchor>
          ) : (
            <div>
              {basicInfoGroupList.map((basicInfoGroup) => (
                <a
                  key={basicInfoGroup}
                  className={[
                    style.basicInfoGroupLabel,
                    basicInfoGroup.active ? style.active : "",
                  ].join(" ")}
                  onClick={() =>
                    this.toggleBasicInfoGroupFilter(basicInfoGroup)
                  }
                >
                  {basicInfoGroup.name}
                </a>
              ))}
            </div>
          ))}

        <dl>
          {basicInfoGroupListShow.map((basicInfoGroup, i) => (
            <>
              {i > 0 && <div className={style.groupSeparator} />}
              {basicInfoGroupList.length > 1 && (
                <div
                  id={`basic-group-${i}`}
                  className={`${i > 0 ? style.offsetMargin : ""} ${
                    style.groupName
                  }`}
                >
                  {basicInfoGroup.name}
                </div>
              )}
              {basicInfoGroup.attrList.map((attr: any, index: number) => {
                //当前模型的一对一关系模型的详情并且为基本信息的第一个属性时，跳转到该关系模型的详情页
                //第一个属性为关系时，取第二个属性，如此类推
                if (
                  this.props.isRelationInstanceDetail &&
                  attr?.tag?.[0] === basicInfoGroupList?.[0]?.name &&
                  index ===
                    basicInfoGroup.attrList.findIndex(
                      (r: any) => !r.__isRelation
                    )
                ) {
                  return this.getAttrListNode(attr, true);
                }
                return this.getAttrListNode(attr);
              })}
            </>
          ))}
        </dl>
      </div>
    );
  }

  getNewProperties(
    oldProperties: Record<string, any>,
    field: keyof LegacyInstanceDetailState
  ): any {
    return mapValues(oldProperties, (propValue) => {
      // istanbul ignore else
      // 这个封装的有点过了感觉，他支持所有的字段都支持注入，但感觉应该是只有dataSource支持就ok了，没必要那么复杂，故这里对于array直接返回
      if (isArray(propValue)) {
        return propValue;
      } else if (isObject(propValue)) {
        return this.getNewProperties(propValue, field);
      } else if (isString(propValue)) {
        const regex = new RegExp("#\\{" + field + "\\}\\.(\\w+)", "g");
        if (regex.test(propValue)) {
          return this.state[field][propValue.replace(regex, "$1")];
        } else {
          return propValue;
        }
      } else {
        return propValue;
      }
    });
  }

  // istanbul ignore next
  getAttrListNode(attr: any, linkFlag?: boolean): React.ReactNode {
    const { isStruct, isStructs, isRelation, isMarkdownField, isUrl, isFloat } =
      this;
    const { modelDataMap, modelData, instanceData } = this.state;
    let config;
    let isComponentMode = false;
    let attrCustomConfig: LegacyCustomComponent;

    if (this.props.attributeConfigs) {
      config = this.props.attributeConfigs[attr.id];
    }
    if (this.props.attrCustomConfigs) {
      // attrCustomConfig = cloneDeep(this.props.attrCustomConfigs[attr.id]);
      attrCustomConfig = this.props.attrCustomConfigs[attr.id];
      if (attrCustomConfig) {
        isComponentMode = true;
        // istanbul ignore next (`component` is deprecated)
        if (attrCustomConfig.component) {
          // eslint-disable-next-line no-console
          console.warn(
            "`component` of `<cmdb-instances.instance-detail>.attrCustomConfigs[attrId].component` is deprecated, use `useBrick` instead."
          );
          attrCustomConfig = cloneDeep(attrCustomConfig);
          const field = (attrCustomConfig.component.field ||
            "instanceData") as keyof LegacyInstanceDetailState;
          attrCustomConfig.component.properties = this.getNewProperties(
            attrCustomConfig.component.properties || {},
            field
          );
        }
      }
    }
    return (
      <>
        <dt
          className={
            isStruct(attr) ||
            isStructs(attr) ||
            isRelation(attr) ||
            attr.__isRelation ||
            isMarkdownField(attr) ||
            (config && config.isWholeLine)
              ? style.structAttr
              : style.basicAttr
          }
        >
          {attr.__isRelation ? attr.right_description : attr.name}
          {attr.description && attr.description !== "" && (
            <Tooltip title={attr.description}>
              <InfoCircleOutlined
                style={{ padding: "0 2px", color: "var(--theme-blue-color)" }}
              />
            </Tooltip>
          )}
          :
        </dt>

        <dd
          className={
            isStruct(attr) ||
            isStructs(attr) ||
            isRelation(attr) ||
            attr.__isRelation ||
            isMarkdownField(attr) ||
            (config && config.isWholeLine)
              ? style.structAttr
              : style.basicAttr
          }
        >
          {/* istanbul ignore next */}
          {isUrl(attr) && <CmdbUrlLink linkStr={instanceData[attr.id]} />}
          {isFloat(attr) && (
            <FloatDisplayBrick floatValue={instanceData[attr.id]} />
          )}
          {isMarkdownField(attr) && !isUrl(attr) && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked(instanceData[attr.id] || "")),
              }}
            />
          )}
          {attr.__isRelation && !isUrl(attr) && (
            <div>
              <InstanceRelationTableShow
                modelDataMap={modelDataMap}
                relationData={attr}
                value={instanceData[attr.__id]?.slice(0, 10)}
                relationFieldUrlTemplate={this.props.relationFieldUrlTemplate}
              />
              {instanceData[attr.__id]?.length >= 10 && (
                <Button
                  data-testid={"view-more-" + attr.__id}
                  type="link"
                  onClick={() => this.handleRelationModal(attr)}
                >
                  {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW_MORE}`)}
                </Button>
              )}
            </div>
          )}
          {!isStructs(attr) &&
            !isStruct(attr) &&
            !isRelation(attr) &&
            isComponentMode &&
            !isUrl(attr) &&
            !isFloat(attr) &&
            (attrCustomConfig.useBrick ? (
              <BrickAsComponent
                useBrick={attrCustomConfig.useBrick}
                data={{
                  modelData,
                  instanceData,
                }}
              />
            ) : (
              <attrCustomConfig.component.brick
                ref={(el: any) => {
                  el &&
                    Object.assign(el, {
                      ...attrCustomConfig.component.properties,
                    });
                }}
              />
            ))}
          {!isStructs(attr) &&
            !isStruct(attr) &&
            !isRelation(attr) &&
            !isMarkdownField(attr) &&
            !isComponentMode &&
            !isUrl(attr) &&
            !isFloat(attr) &&
            (linkFlag ? (
              <Link
                to={`/next-cmdb-instance-management/next/${instanceData._object_id}/instance/${instanceData.instanceId}`}
                target={"_blank"}
              >
                <InstanceFormat
                  objectId={modelData.objectId}
                  attrModel={attr}
                  attrData={instanceData[attr.id]}
                />
              </Link>
            ) : (
              <InstanceFormat
                objectId={modelData.objectId}
                attrModel={attr}
                attrData={instanceData[attr.id]}
              />
            ))}
          {isStruct(attr) && instanceData[attr.id] && !isUrl(attr) && (
            <StructTable
              isLegacy={true}
              attribute={attr}
              structData={instanceData[attr.id]}
              isEditable={false}
            />
          )}
          {isStructs(attr) && instanceData[attr.id] && !isUrl(attr) && (
            <StructTable
              attribute={attr}
              structData={instanceData[attr.id]}
              isEditable={false}
            />
          )}
        </dd>
      </>
    );
  }
  // istanbul ignore next
  async handleRelationModal(attr: any): Promise<void> {
    await this.searchInstanceRelationData(1, 10, attr);
  }

  // istanbul ignore next
  async searchInstanceRelationData(
    page: number,
    pageSize: number,
    attr: any,
    value?: string
  ): Promise<void> {
    const { right_id, left_object_id, right_object_id, left_id } = attr;
    let objectId, queryId, oppositeId;
    const { modelData, modelDataMap } = this.state;
    const hideColumns = modelData?.view?.hide_columns || [];
    if (
      left_object_id === modelData.objectId &&
      !hideColumns.includes(left_id)
    ) {
      objectId = right_object_id;
      queryId = right_id;
      oppositeId = left_id;
    }
    if (
      right_object_id === modelData.objectId &&
      !hideColumns.includes(right_id)
    ) {
      objectId = left_object_id;
      queryId = left_id;
      oppositeId = right_id;
    }
    const defaultRelationFields = get(modelData, [
      "view",
      "relation_default_attr",
      oppositeId,
    ]);
    const fields = defaultRelationFields?.length
      ? defaultRelationFields.map((item: string) =>
          item.startsWith("#") ? item.slice(1) : item
        )
      : uniq(map(modelDataMap[objectId]?.attrList, "id"));

    let query = {};

    if (value !== undefined ? value : this.state.searchValue) {
      query = getQuery(
        modelDataMap[objectId],
        modelDataMap,
        value !== undefined ? value : this.state.searchValue,
        fields,
        false
      );
    }

    const params: InstanceApi_PostSearchV3RequestBody = {
      fields,
      page,
      page_size: pageSize,
      ignore_missing_field_error: true,
      query: {
        [`${queryId}.instanceId`]: {
          $eq: this.props.instanceId,
        },
        ...query,
      },
    };
    const instanceRelationModalData = await fetchCmdbInstanceSearch(
      objectId,
      params
    );

    this.setState({
      instanceRelationModalData,
      currentAttr: attr,
      relationTablePagination: {
        current: page,
        pageSize: pageSize,
      },
      searchValue: value !== undefined ? value : this.state.searchValue,
    });
  }

  // istanbul ignore next
  formatBasicInfoGroupList(
    modelData: Partial<ModifiedModelCmdbObject>,
    basicInfoGroupList: any[]
  ) {
    // let { modelData, basicInfoGroupList } = state;
    const { attributeKeys, fieldsByTag } = this.props;
    let basicInfoAttrList: any[];

    basicInfoGroupList = [];

    if (fieldsByTag) {
      basicInfoGroupList = map(fieldsByTag, (tag) => {
        const attrList = compact(
          map(tag.fields, (attr) => {
            const matched = modelData.__fieldList.find(
              (field) => field.__id === attr
            );
            return matched;
          })
        );
        return {
          name: tag.name,
          active: false,
          attrList,
        };
      });
    } else {
      if (attributeKeys?.length) {
        basicInfoAttrList = attributeKeys
          .map((attr) => {
            const matched = modelData.__fieldList.find(
              (field) => field.__id === attr
            );
            if (matched && attrFilter(matched, modelData)) {
              return matched;
            }
          })
          .filter((attr) => attr);
      } else {
        basicInfoAttrList = modelData.__fieldList.filter((field) =>
          attrFilter(field, modelData)
        );
      }

      basicInfoAttrList.forEach((field) => {
        let groupTag: string;
        const nameKey = getInstanceNameKeys(modelData)[0];
        if (field.__isRelation) {
          groupTag =
            field.left_tags?.length && field.left_tags[0].trim() !== ""
              ? field.left_tags[0]
              : "";
          /*
              原有逻辑，没有tag会根据默认在基本信息中展示，导致删除了的关系在实例详情中还存在。
              groupTag = field.left_tags?.length && field.left_tags[0].trim() !== ""
              ? field.left_tags[0]
              : DEFAULT_ATTRIBUTE_TAG;
            */
        } else {
          const basicInfoText = i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.BASIC_INFORMATION}`
          );
          groupTag =
            field.tag?.length > 0
              ? field.tag[0] || basicInfoText
              : basicInfoText;
        }

        const basicInfoGroup = basicInfoGroupList.find(
          (item: any) => item.name === groupTag
        );

        if (basicInfoGroup) {
          field.id === nameKey
            ? basicInfoGroup["attrList"].unshift(field)
            : basicInfoGroup["attrList"].push(field);
        } else {
          basicInfoGroupList.push({
            name: groupTag,
            active: false,
            attrList: [field],
          });
        }
      });
    }
    // 用于处理分类排序失效问题
    const basicInfoGroups: any[] = [];
    const basicInfoGroupNameList = basicInfoGroupList.map(
      (basicInfo) => basicInfo.name
    );
    const attrCategoryOrder = modelData.view.attr_category_order.filter(
      (category) => basicInfoGroupNameList.includes(category)
    );
    basicInfoGroupList.forEach((v) => {
      const index = attrCategoryOrder.findIndex(
        (category) => category === v.name
      );
      basicInfoGroups[index] = v;
    });

    return basicInfoGroups;
  }

  // istanbul ignore next
  setBasicInfoGroupList(state: LegacyInstanceDetailState) {
    const { modelData, basicInfoGroupList } = state;
    const basicInfoList = this.formatBasicInfoGroupList(
      modelData,
      basicInfoGroupList
    );
    this.setState({
      basicInfoGroupList: basicInfoList,
      basicInfoGroupListShow: basicInfoList,
    });
  }
  componentDidUpdate(prevProps: LegacyInstanceDetailProps): void {
    if (
      this.props.objectId &&
      this.props.instanceId &&
      prevProps.instanceId !== this.props.instanceId
    ) {
      (async () => await this.fetchData(this.props))();
    }
  }

  async componentDidMount(): Promise<void> {
    if (this.props.actions) {
      const buttonActions: BrickAction[] = [];
      const dropdownActions: BrickAction[] = [];

      this.props.actions.forEach((action) => {
        switch (action.type) {
          case "dropdown":
            dropdownActions.push(action);
            break;
          case "button":
          default:
            buttonActions.push(action);
            break;
        }
      });

      this.setState({ buttonActions, dropdownActions });
    }
    if (this.props.instanceId && this.props.objectId) {
      await this.fetchData(this.props);
    }
    this.scrollToTarget();
  }

  toggleBasicInfoGroupFilter(basicInfoGroup: any): void {
    const { basicInfoGroupList } = this.state;
    if (!basicInfoGroup.active) {
      basicInfoGroupList.forEach((item: any) => {
        item.active = false;
      });
      this.setState({
        basicInfoGroupListShow: basicInfoGroupList.filter(
          (item: any) => item.name === basicInfoGroup.name
        ),
      });
    } else {
      this.setState({
        basicInfoGroupListShow: basicInfoGroupList,
      });
    }
    basicInfoGroup.active = !basicInfoGroup.active;
  }

  // istanbul ignore next
  getInstanceDetailData(
    props: LegacyInstanceDetailProps,
    modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject }
  ) {
    const modelData = modelDataMap[props.objectId];
    const hideModelData = modelData.view.hide_columns || [];
    const filterModelData = {
      ...modelData,
      attrList: modelData.attrList.filter(
        (item) => !hideModelData.includes(item.id)
      ),
      relation_list: modelData.relation_list.filter(
        (item) =>
          !(
            (hideModelData.includes(item.left_id) &&
              item.left_object_id === props.objectId) ||
            (hideModelData.includes(item.right_id) &&
              item.right_object_id === props.objectId)
          )
      ),
    };
    const basicInfoGroupList = this.formatBasicInfoGroupList(
      modifyModelData(filterModelData),
      []
    );
    let attrIdList = flatten(
      basicInfoGroupList.map((v) => {
        return v.attrList.map((attr: any) => attr.id || attr.__id);
      })
    );

    const relationDefaultFields = get(filterModelData, [
      "view",
      "relation_default_attr",
    ]);
    if (relationDefaultFields) {
      attrIdList = getRelationShowKeys(attrIdList, relationDefaultFields);
    }
    const fields = uniq([
      "_object_id",
      "instanceId",
      "creator",
      "ctime",
      "modifier",
      "mtime",
      ...attrIdList,
    ]).join(",");
    return {
      modelData,
      filterModelData,
      fields,
    };
  }

  // istanbul ignore next
  async fetchData(props: LegacyInstanceDetailProps): Promise<void> {
    let modelListData, modelDataMap, instanceData;
    const relationLimit = 10;
    try {
      if (props.modelDataList) {
        modelDataMap = keyBy(props.modelDataList, "objectId");
        if (props.showFields) {
          const { fields } = this.getInstanceDetailData(props, modelDataMap);
          instanceData = await fetchCmdbInstanceDetailByFields(
            props.objectId,
            props.instanceId,
            fields,
            relationLimit
          );
        } else {
          instanceData = await fetchCmdbInstanceDetail(
            props.objectId,
            props.instanceId
          );
        }
      } else {
        if (props.showFields) {
          modelListData = await fetchCmdbObjectRef(props.objectId);
          modelDataMap = keyBy(modelListData.data, "objectId") as {
            [objectId: string]: CmdbModels.ModelCmdbObject;
          };
          const { fields } = this.getInstanceDetailData(props, modelDataMap);
          instanceData = await fetchCmdbInstanceDetailByFields(
            props.objectId,
            props.instanceId,
            fields,
            relationLimit
          );
        } else {
          [modelListData, instanceData] = await Promise.all([
            fetchCmdbObjectRef(props.objectId),
            fetchCmdbInstanceDetail(props.objectId, props.instanceId),
          ]);
          modelDataMap = keyBy(modelListData.data, "objectId") as {
            [objectId: string]: CmdbModels.ModelCmdbObject;
          };
        }
      }
      const { filterModelData } = this.getInstanceDetailData(
        props,
        modelDataMap
      );
      this.setState({
        modelDataMap,
        modelData: modifyModelData(filterModelData),
        instanceData,
        loaded: true,
        basicInfoGroupListShow: [],
        basicInfoGroupList: [],
      });
      this.setBasicInfoGroupList(this.state);
      // this.setFormattedInstanceData(this.state);
    } catch (e) {
      // 统一处理请求错误
      handleHttpError(e);
      // 标记 `loaded` 和 `failed` 状态
      this.setState({ loaded: true });
    }
  }

  isStruct(attr: any) {
    return attr.value?.type === "struct";
  }

  isStructs(attr: any) {
    return attr.value?.type === "structs";
  }
  isUrl(attr: any) {
    return attr.value?.type === "str" && attr.value?.mode === "url";
  }

  isRelation(attr: any) {
    return attr.value?.type === "FK" || attr.value?.type === "FKs";
  }
  isFloat(attr: any) {
    return attr.value?.type === "float";
  }

  isSpecialDisplayField(attr: any) {
    return (
      // TODO: ENABLED_FEATURES.includes("user-business-special-display") &&
      ["USER", "BUSINESS"].includes(
        attr.id === attr.left_id ? attr.right_object_id : attr.left_object_id
      )
    );
  }

  isMarkdownField(attr: any) {
    return attr.value?.type === "str" && get(attr, "value.mode") === "markdown";
  }
}

export const InstanceDetail = withTranslation(NS_LIBS_CMDB_INSTANCES)(
  LegacyInstanceDetail
);
