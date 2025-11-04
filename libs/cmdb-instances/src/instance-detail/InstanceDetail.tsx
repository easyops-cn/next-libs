import React, { createRef } from "react";
import {
  DownOutlined,
  InfoCircleFilled,
  ExclamationCircleFilled,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
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
import { http } from "@next-core/brick-http";
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
  isNil,
  filter,
  head,
  isEmpty,
} from "lodash";
import {
  handleHttpError,
  BrickAsComponent,
  getHistory,
  httpErrorToString,
  EasyopsEmpty,
} from "@next-core/brick-kit";
import {
  AttributeConfig,
  CustomBrickConfig,
  CustomDisplay,
  InstanceDisplay,
  BrickAction,
} from "@next-core/brick-types";
import { InstanceRelationTableShow } from "./components/instance-relation-table-show/instance-relation-table-show";
import { InstancesAttachmentDisplay } from "./components/instances-attachment-display/instances-attachment-display";
import {
  getInstanceNameKeys,
  modifyModelData,
  IGNORED_FIELDS,
  ModifiedModelCmdbObject,
  ModifiedModelObjectField,
  TransHierRelationType,
} from "@next-libs/cmdb-utils";
import {
  CmdbModels,
  InstanceApi_PostSearchV3RequestBody,
  CmdbObjectApi_list,
} from "@next-sdk/cmdb-sdk";
import { Link } from "@next-libs/basic-components";
import { CodeDisplay } from "@next-libs/code-display-components";
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
import { JsonDisplayBrick } from "../json-display-brick/JsonDisplayBrick";
import ResizeObserver from "resize-observer-polyfill";
import classNames from "classnames";

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
      (field as any).__isTransHierRelation
        ? (field as any).tags?.[0]
        : (field as CmdbModels.ModelObjectRelation).left_tags?.[0]
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
  ignorePermission?: boolean;
  useHttpErrorString?: boolean;
  externalSourceId?: string;
  attrGangedConfig?: Record<string, any>[];
  displayFields?: Record<string, any>[];
  instanceDataFormatter?: (instanceData: any) => any;
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
  oppositeObjectId?: string;
  oppositeModelDataMap?: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  filterObjectId?: string;
  scrollContainer?: HTMLElement;
  httpErrorSting?: string;
  externalSourceId?: string;
  displayColumns?: number;
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
          label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATE_TIME}`),
        },
        {
          value: "modifier",
          label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MODIFIER}`),
        },
        {
          value: "mtime",
          label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MODIFY_TIME}`),
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
      scrollContainer: null,
      httpErrorSting: "",
      externalSourceId: "",
      displayColumns: null,
    };
  }
  private cardContentRef = createRef<HTMLDivElement>();
  private cardContentResize: ResizeObserver;

  render(): React.ReactNode {
    const { loaded, currentAttr, instanceRelationModalData, httpErrorSting } =
      this.state;
    const {
      showCard = true,
      useHttpErrorString = false,
      externalSourceId,
    } = this.props;
    return (
      // React Fragments
      <Spin spinning={!loaded}>
        {loaded && !httpErrorSting && (
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
                  filterObjectId: null,
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
                  filterObjectId: null,
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
                        value,
                        externalSourceId
                      );
                    }}
                    enterButton
                  />
                }
                <InstanceRelationTableShow
                  objectId={this.props.objectId}
                  modelDataMap={this.state.modelDataMap}
                  relationData={currentAttr}
                  hideRelationLink={this.props.ignorePermission}
                  value={
                    instanceRelationModalData
                      ? instanceRelationModalData?.list || []
                      : []
                  }
                  onInstanceSourceChange={(_object_id) => {
                    if (_object_id !== this.state.filterObjectId) {
                      this.setState({ filterObjectId: _object_id }, () => {
                        this.searchInstanceRelationData(
                          1,
                          this.state.relationTablePagination.pageSize,
                          this.state.currentAttr,
                          undefined,
                          externalSourceId
                        );
                      });
                    }
                  }}
                  relationTablePagination={this.state.relationTablePagination}
                  relationFieldUrlTemplate={this.props.relationFieldUrlTemplate}
                  isPagination={true}
                  externalSourceId={externalSourceId}
                  total={instanceRelationModalData?.total || 0}
                  paginationChange={(page, pageSize, relationData) => {
                    if (
                      page !== this.state.relationTablePagination.current ||
                      pageSize !== this.state.relationTablePagination.pageSize
                    ) {
                      this.searchInstanceRelationData(
                        page,
                        pageSize,
                        relationData,
                        undefined,
                        externalSourceId
                      );
                    }
                  }}
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
        {httpErrorSting && (
          <div className={style.emptyWrap}>
            <EasyopsEmpty
              imageStyle={{ height: "200px" }}
              illustration={{ name: "no-permission", category: "easyops2" }}
              description={httpErrorSting}
            />
          </div>
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
    const firstGroup = document.getElementById("basic-group-0");
    if (!firstGroup) {
      return;
    }
    const pageView = document.querySelector("eo-page-view");
    const pageContainer =
      pageView?.contains(firstGroup) &&
      (pageView.shadowRoot?.querySelector(".content") as HTMLElement);
    const scrollContainer =
      pageContainer && pageContainer.scrollHeight > pageContainer.clientHeight
        ? pageContainer
        : null;
    const target = document.getElementById(location.hash.slice(1));
    const initOffset =
      firstGroup.offsetTop +
      (this.props.anchorOffset ?? 0) +
      (scrollContainer ? -54 : 0);
    this.setState({
      initOffset,
      scrollContainer,
    });
    if (target) {
      setTimeout(() => {
        if (!scrollContainer) {
          window.scrollTo({
            top: target.offsetTop + initOffset + 65,
          });
        } else {
          target.scrollIntoView({
            behavior: "auto",
            block: "start",
            inline: "start",
          });
        }
      });
    }
  }

  getCardContent(): React.ReactNode {
    const { basicInfoGroupList, basicInfoGroupListShow, scrollContainer } =
      this.state;
    const { useAnchor } = this.props;
    const { Link } = Anchor;
    return (
      <div
        className={classNames([style.detailCard, shared.showMultipleLines], {
          [style.oneColumnCard]: this.state.displayColumns === 1,
          [style.twoColumnCard]: this.state.displayColumns === 2,
        })}
        ref={this.cardContentRef}
      >
        {basicInfoGroupList.length > 1 &&
          (useAnchor ? (
            <Anchor
              affix={true}
              offsetTop={this.state.initOffset}
              className={style.anchorWrapper}
              getContainer={() => scrollContainer ?? window}
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
    const {
      isStruct,
      isStructs,
      isRelation,
      isMarkdownField,
      isXmlField,
      isPasswordField,
      isUrl,
      isFloat,
      isJson,
      isAttachment,
    } = this;
    const { modelDataMap, modelData, instanceData, externalSourceId } =
      this.state;
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
    const attrGangedConfig = this.props.attrGangedConfig || [];
    const displayFields = this.props.displayFields || [];
    return (
      <>
        <dt
          className={
            isStruct(attr) ||
            isStructs(attr) ||
            isAttachment(attr) ||
            isXmlField(attr) ||
            isRelation(attr) ||
            attr.__isRelation ||
            attr.__isTransHierRelation ||
            isMarkdownField(attr) ||
            (config && config.isWholeLine)
              ? style.structAttr
              : style.basicAttr
          }
        >
          <div className={style.labelContainer}>
            <Tooltip
              title={
                attr.__isRelation
                  ? attr.right_description
                  : attr.__isTransHierRelation
                  ? attr.relation_name
                  : attr.name
              }
              className={style.labelTooltip}
            >
              {attr.__isRelation
                ? attr.right_description
                : attr.__isTransHierRelation
                ? attr.relation_name
                : attr.name}
            </Tooltip>
            {attr.description && attr.description !== "" && (
              <Tooltip title={attr.description}>
                <ExclamationCircleFilled
                  style={{
                    padding: "0 2px 4px 2px",
                    color: "var(--color-secondary-text)",
                  }}
                />
              </Tooltip>
            )}
            :
          </div>
        </dt>

        <dd
          className={
            isStruct(attr) ||
            isAttachment(attr) ||
            isStructs(attr) ||
            isXmlField(attr) ||
            isRelation(attr) ||
            attr.__isRelation ||
            attr.__isTransHierRelation ||
            isMarkdownField(attr) ||
            (config && config.isWholeLine)
              ? style.structAttr
              : style.basicAttr
          }
        >
          {/* istanbul ignore next */}
          {isJson(attr) && (
            <JsonDisplayBrick
              name={attr.name}
              value={instanceData[attr.id]}
              isNumControlEllipsis={true}
            />
          )}
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
          {isAttachment(attr) && (
            <InstancesAttachmentDisplay value={instanceData[attr.id]} />
          )}
          {isXmlField(attr) && (
            <CodeDisplay
              language="xml"
              value={instanceData[attr.id]}
              maxLines={20}
              minLines={5}
              showLineNumber={true}
              showExportButton={false}
              showCopyButton={true}
            />
          )}
          {isPasswordField(attr) && (
            <span className="attr-field">
              {"*".repeat(instanceData[attr.id]?.length)}
            </span>
          )}

          {(attr.__isRelation || attr.__isTransHierRelation) && !isUrl(attr) && (
            <div>
              <InstanceRelationTableShow
                objectId={this.props.objectId}
                hideRelationLink={this.props.ignorePermission}
                modelDataMap={modelDataMap}
                relationData={attr}
                value={instanceData[attr.__id]?.slice(0, 10)}
                relationFieldUrlTemplate={this.props.relationFieldUrlTemplate}
                filterInstanceSourceDisabled={true}
                externalSourceId={externalSourceId}
                relationGangedConfig={head(
                  attrGangedConfig.filter(
                    (c) => c.isRelation && c.attrId === attr.__id
                  )
                )}
              />
              {instanceData[attr.__id]?.length >= 10 && (
                <Button
                  data-testid={"view-more-" + attr.__id}
                  type="link"
                  onClick={() =>
                    this.handleRelationModal(attr, externalSourceId)
                  }
                >
                  {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW_MORE}`)}
                </Button>
              )}
            </div>
          )}
          {!isStructs(attr) &&
            !isStruct(attr) &&
            !isAttachment(attr) &&
            !isRelation(attr) &&
            !isXmlField(attr) &&
            !isPasswordField(attr) &&
            isComponentMode &&
            !isUrl(attr) &&
            !isFloat(attr) &&
            !isJson(attr) &&
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
            !isAttachment(attr) &&
            !isRelation(attr) &&
            !isMarkdownField(attr) &&
            !isXmlField(attr) &&
            !isPasswordField(attr) &&
            !isComponentMode &&
            !isUrl(attr) &&
            !isFloat(attr) &&
            !isJson(attr) &&
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
  async handleRelationModal(
    attr: any,
    externalSourceId?: string
  ): Promise<void> {
    await this.searchInstanceRelationData(
      1,
      10,
      attr,
      undefined,
      externalSourceId
    );
  }

  // istanbul ignore next
  async searchInstanceRelationData(
    page: number,
    pageSize: number,
    attr: any,
    value?: string,
    externalSourceId?: string
  ): Promise<void> {
    const isTransHierRelation = attr.__isTransHierRelation;
    const { right_id, left_object_id, right_object_id, left_id } = attr;
    let objectId: string, queryId: string, oppositeId: string;
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

    // 自关联的场景
    if (right_object_id === left_object_id && attr.__id) {
      objectId = left_object_id;
      queryId = attr.__id === left_id ? right_id : left_id;
      oppositeId = attr.__id === left_id ? left_id : right_id;
    }
    if (isTransHierRelation) {
      objectId = attr.relation_object;
    }

    const defaultRelationFields = get(modelData, [
      "view",
      "relation_default_attr",
      isTransHierRelation ? attr.__id : oppositeId,
    ]);
    const fields = defaultRelationFields?.length
      ? defaultRelationFields.map((item: string) =>
          item.startsWith("#") ? item.slice(1) : item
        )
      : uniq(map(modelDataMap[objectId]?.attrList, "id"));
    if (modelDataMap[objectId]?.isAbstract) {
      fields.unshift("_object_id");
    }
    let query = {};
    if (value !== undefined ? value : this.state.searchValue) {
      let oppositeModelDataMap = this.state.oppositeModelDataMap;
      if (this.state.oppositeObjectId !== objectId) {
        const oppositeModelList = await fetchCmdbObjectRef(
          objectId,
          externalSourceId
        );
        oppositeModelDataMap = keyBy(oppositeModelList.data, "objectId");
        this.setState({
          oppositeObjectId: objectId,
          oppositeModelDataMap,
        });
      }
      query = getQuery(
        modelDataMap[objectId],
        oppositeModelDataMap,
        value !== undefined ? value : this.state.searchValue,
        fields,
        false
      );
    }
    if (!isNil(this.state.filterObjectId)) {
      query = {
        ...query,
        _object_id: this.state.filterObjectId,
      };
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
    let instanceRelationModalData;
    if (isTransHierRelation) {
      instanceRelationModalData = (
        (await http.post(
          `api/gateway/logic.cmdb.service/object/${this.props.objectId}/relation/${attr.relation_id}/instance/${this.props.instanceId}`,
          {
            ...params,
            query_relation: query,
            query: {},
          }
        )) as any
      ).data;
    } else {
      if (this.props.ignorePermission) {
        instanceRelationModalData = (
          (await http.post(
            `api/gateway/easyops.api.cmdb.instance.PostSearchV3WithAdmin/v3/object/${objectId}/instance/_search`,
            {
              ...params,
            }
          )) as any
        ).data;
      } else {
        instanceRelationModalData = await fetchCmdbInstanceSearch(
          objectId,
          params,
          externalSourceId
        );
      }
    }

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
        } else if (field.__isTransHierRelation) {
          groupTag =
            field.tags?.length && field.tags[0].trim() !== ""
              ? field.tags[0]
              : "";
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
      modifyModelData(modelData, true),
      basicInfoGroupList
    );
    this.setState({
      basicInfoGroupList: basicInfoList,
      basicInfoGroupListShow: basicInfoList,
    });
  }
  listenCardContent() {
    if (this.cardContentRef?.current) {
      this.cardContentResize = new ResizeObserver(() => {
        const { width } = this.cardContentRef.current.getBoundingClientRect();
        let displayColumns: number;
        if (width < 600) {
          displayColumns = 1;
        } else if (width < 900) {
          displayColumns = 2;
        } else {
          displayColumns = 3;
        }
        this.setState({ displayColumns });
      });
      this.cardContentResize.observe(this.cardContentRef.current);
    }
  }

  componentDidUpdate(prevProps: LegacyInstanceDetailProps): void {
    if (
      this.props.objectId &&
      this.props.instanceId &&
      prevProps.instanceId !== this.props.instanceId
    ) {
      (async () => {
        await this.fetchData(this.props);
        if (!this.cardContentResize) {
          this.listenCardContent();
        }
      })();
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
      this.listenCardContent();
    }
    this.scrollToTarget();
  }

  componentWillUnmount() {
    this.cardContentResize?.disconnect();
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
  // 用于处理模型关系自关联的字段场景
  // istanbul ignore next
  isSelfRelation(
    relation: any,
    hideModelData: string[],
    objectId: string
  ): boolean {
    const { left_object_id, right_object_id, left_id, right_id } = relation;
    if (left_object_id === right_object_id) {
      return false;
    }
    return (
      (hideModelData.includes(left_id) && left_object_id === objectId) ||
      (hideModelData.includes(right_id) && right_object_id === objectId)
    );
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
        (item) => !this.isSelfRelation(item, hideModelData, props.objectId)
      ),
    };
    const basicInfoGroupList = this.formatBasicInfoGroupList(
      modifyModelData(filterModelData, true),
      []
    );
    let attrIdList = flatten(
      basicInfoGroupList.map((v) => {
        return v.attrList.map((attr: any) => attr.id || `${attr.__id}.*`);
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
    let modelListData, instanceData: any;
    let modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject };
    const relationLimit = 10;
    const externalSourceId = props.externalSourceId;
    try {
      if (props.modelDataList) {
        modelDataMap = keyBy(props.modelDataList, "objectId");
        if (props.showFields) {
          const { fields } = this.getInstanceDetailData(props, modelDataMap);
          instanceData = await fetchCmdbInstanceDetailByFields(
            props.objectId,
            props.instanceId,
            fields,
            relationLimit,
            externalSourceId
          );
        } else {
          instanceData = await fetchCmdbInstanceDetail(
            props.objectId,
            props.instanceId,
            externalSourceId
          );
        }
      } else {
        if (props.showFields) {
          modelListData = await fetchCmdbObjectRef(
            props.objectId,
            externalSourceId
          );
          modelDataMap = keyBy(modelListData.data, "objectId") as {
            [objectId: string]: CmdbModels.ModelCmdbObject;
          };
          const { fields } = this.getInstanceDetailData(props, modelDataMap);
          instanceData = await fetchCmdbInstanceDetailByFields(
            props.objectId,
            props.instanceId,
            fields,
            relationLimit,
            externalSourceId
          );
        } else {
          if (props.ignorePermission) {
            [modelListData, { data: instanceData }] = await Promise.all([
              fetchCmdbObjectRef(props.objectId, externalSourceId),
              http.get(
                `api/gateway/easyops.api.cmdb.instance.GetDetailWithAdmin/object/${props.objectId}/instance/${props.instanceId}`,
                {}
              ) as any,
            ]);
          } else {
            [modelListData, instanceData] = await Promise.all([
              fetchCmdbObjectRef(props.objectId, externalSourceId),
              fetchCmdbInstanceDetail(
                props.objectId,
                props.instanceId,
                externalSourceId
              ),
            ]);
          }
          modelDataMap = keyBy(modelListData.data, "objectId") as {
            [objectId: string]: CmdbModels.ModelCmdbObject;
          };
        }
      }
      const modelData = modelDataMap[props.objectId];
      const transHierRelationSideObjectIds: string[] = (
        modelData.view as any
      )?.trans_hier_relation_list?.map(
        (i: TransHierRelationType) => i.relation_object
      );

      if (
        transHierRelationSideObjectIds?.length &&
        !transHierRelationSideObjectIds.every((i) => modelDataMap[i])
      ) {
        const transHierRelationSideObjectList = (
          await CmdbObjectApi_list({
            page: 1,
            page_size: transHierRelationSideObjectIds.length,
            objectIds: transHierRelationSideObjectIds.join(","),
          })
        ).list;
        modelDataMap = {
          ...modelDataMap,
          ...(keyBy(transHierRelationSideObjectList, "objectId") as {
            [objectId: string]: CmdbModels.ModelCmdbObject;
          }),
        };
      }
      const { filterModelData } = this.getInstanceDetailData(
        props,
        modelDataMap
      );
      // 用于过滤自关联场景隐藏一端模型的情况
      const _modelData = modifyModelData(filterModelData);
      const hideModelData = _modelData.view.hide_columns || [];
      const attrGangedConfig = props.attrGangedConfig || [];
      const displayFields = props.displayFields || [];
      const cloneModelData = cloneDeep(_modelData);
      if (instanceData && attrGangedConfig.length !== 0) {
        attrGangedConfig
          .filter((c) => !c.isRelation)
          .forEach((item) => {
            const value = instanceData[item.attrId];
            if (item.objectId === props.objectId && value) {
              const hiddenField = get(
                filter(item.control, (i: any) => i.value === value),
                "[0].hiddenField",
                []
              );
              if (hiddenField && hiddenField.length !== 0) {
                cloneModelData.__fieldList = cloneModelData.__fieldList.filter(
                  (attr: any) =>
                    !hiddenField.includes(attr.id) &&
                    !hiddenField.includes(attr.__id)
                );
              }
            }
          });
        _modelData.__fieldList = cloneModelData.__fieldList;
      }
      if (displayFields.length > 0) {
        _modelData.__fieldList.forEach((item: any) => {
          const fieldId = item.__isRelation ? item.__id : item.id;
          const field = displayFields.find((f) => f.field === fieldId);
          if (field) {
            item[item.__isRelation ? "right_description" : "name"] =
              field.label;
          }
        });
      }

      const _state = {
        modelDataMap,
        modelData: {
          ..._modelData,
          relation_list: _modelData.relation_list.filter(
            (item: any) => !hideModelData.includes(item.__id)
          ),
          __fieldList: _modelData.__fieldList.filter(
            (item: any) => !hideModelData.includes(item.__id)
          ),
        },
        instanceData: props.instanceDataFormatter
          ? props.instanceDataFormatter(instanceData)
          : instanceData,
        loaded: true,
        basicInfoGroupListShow: [],
        basicInfoGroupList: [],
        externalSourceId,
      } as LegacyInstanceDetailState;
      this.setState({ ..._state });
      this.setBasicInfoGroupList(_state);
      // this.setFormattedInstanceData(this.state);
    } catch (e) {
      // 统一处理请求错误
      // handleHttpError(e);
      if (this.props.useHttpErrorString) {
        this.setState({ httpErrorSting: httpErrorToString(e) });
      } else {
        handleHttpError(e);
      }
      // 标记 `loaded` 和 `failed` 状态
      this.setState({ loaded: true });
    }
  }

  isStruct(attr: any) {
    return attr.value?.type === "struct";
  }

  isStructs(attr: any) {
    return attr.value?.type === "structs" && attr.value?.mode !== "attachment";
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
  isJson(attr: any) {
    return attr.value?.type === "json";
  }

  // 判断是否为附件
  isAttachment(attr: any) {
    return attr.value?.type === "structs" && attr.value?.mode === "attachment";
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

  isPasswordField(attr: any) {
    return attr.value?.type === "str" && get(attr, "value.mode") === "password";
  }

  isXmlField(attr: any) {
    return attr.value?.type === "str" && get(attr, "value.mode") === "xml";
  }
}

export const InstanceDetail = withTranslation(NS_LIBS_CMDB_INSTANCES)(
  LegacyInstanceDetail
);
