import React from "react";
import { DownOutlined, InfoCircleFilled } from "@ant-design/icons";
import { Card, Popover, Spin, Button, Menu, Dropdown } from "antd";
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
} from "lodash";
import { handleHttpError, BrickAsComponent } from "@next-core/brick-kit";
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
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { Link } from "@next-libs/basic-components";
import { StructTable } from "../struct-components/StructTable";
import { FieldsByTag } from "../model-attribute-form/ModelAttributeForm";
import { InstanceFormat } from "../components";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import style from "./index.module.css";
import shared from "./shared.module.css";

import { fetchCmdbObjectRef, fetchCmdbInstanceDetail } from "../data-providers";
import {
  DEFAULT_ATTRIBUTE_TAG_STR,
  BASIC_INFORMATION_RELATION_GROUP_ID,
  DEFAULT_ATTRIBUTE_TAG,
} from "./constants";
import { isArray } from "util";
import { UseBrickConf } from "@next-core/brick-types";

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
    };
  }

  render(): React.ReactNode {
    const { loaded } = this.state;
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
          {dropdownActions.map((action) => {
            if (action.url) {
              return (
                <Menu.Item>
                  <Link to={action.url}>
                    <span className={action.isDanger ? style.danger : ""}>
                      {action.label}
                    </span>
                  </Link>
                </Menu.Item>
              );
            } else if (action.event) {
              return (
                <Menu.Item onClick={(e) => this.onActionClick(action.event)}>
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
          buttonActions.map((action) => {
            if (action.url) {
              return (
                <Button>
                  <Link to={action.url}>{action.label}</Link>
                </Button>
              );
            } else if (action.event) {
              return (
                <Button onClick={(e) => this.onActionClick(action.event)}>
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

  getCardContent(): React.ReactNode {
    const { basicInfoGroupList, basicInfoGroupListShow } = this.state;
    return (
      <div className={`${style.detailCard} ${shared.showMultipleLines}`}>
        {basicInfoGroupList.length > 1 && (
          <div>
            {basicInfoGroupList.map((basicInfoGroup) => (
              <a
                key={basicInfoGroup}
                className={[
                  style.basicInfoGroupLabel,
                  basicInfoGroup.active ? style.active : "",
                ].join(" ")}
                onClick={() => this.toggleBasicInfoGroupFilter(basicInfoGroup)}
              >
                {basicInfoGroup.name}
              </a>
            ))}
          </div>
        )}
        <dl>
          {basicInfoGroupListShow.map((basicInfoGroup, i) => (
            <>
              {i > 0 && <div className={style.groupSeparator} />}
              {basicInfoGroupList.length > 1 && (
                <div className={style.groupName}>{basicInfoGroup.name}</div>
              )}
              {basicInfoGroup.attrList.map((attr: any) =>
                this.getAttrListNode(attr)
              )}
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
  getAttrListNode(attr: any): React.ReactNode {
    const { isStruct, isStructs, isRelation, isMarkdownField } = this;
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
            isMarkdownField(attr) ||
            (config && config.isWholeLine)
              ? style.structAttr
              : style.basicAttr
          }
        >
          {attr.__isRelation ? attr.right_description : attr.name}:
        </dt>

        <dd
          className={
            isStruct(attr) ||
            isStructs(attr) ||
            isRelation(attr) ||
            isMarkdownField(attr) ||
            (config && config.isWholeLine)
              ? style.structAttr
              : style.basicAttr
          }
        >
          {/* istanbul ignore next */}
          {isMarkdownField(attr) && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked(instanceData[attr.id] || "")),
              }}
            ></div>
          )}
          {attr.__isRelation && (
            <InstanceRelationTableShow
              modelDataMap={modelDataMap}
              relationData={attr}
              value={instanceData[attr.__id]}
              relationFieldUrlTemplate={this.props.relationFieldUrlTemplate}
            ></InstanceRelationTableShow>
          )}
          {!isStructs(attr) &&
            !isStruct(attr) &&
            !isRelation(attr) &&
            isComponentMode &&
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
            !isComponentMode && (
              <InstanceFormat
                objectId={modelData.objectId}
                attrModel={attr}
                attrData={instanceData[attr.id]}
              />
            )}
          {isStruct(attr) && instanceData[attr.id] && (
            <StructTable
              isLegacy={true}
              attribute={attr}
              structData={instanceData[attr.id]}
              isEditable={false}
            />
          )}
          {isStructs(attr) && instanceData[attr.id] && (
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
  setBasicInfoGroupList(state: LegacyInstanceDetailState) {
    let { modelData, basicInfoGroupList } = state;
    const { attributeKeys, fieldsByTag } = this.props;
    let basicInfoAttrList: any[];
    function attrFilter(field: ModifiedModelObjectField): boolean {
      if (IGNORED_FIELDS[modelData.objectId]?.includes(field.__id)) {
        return false;
      }
      // 没有分组的关系都不显示
      if (
        field.__isRelation &&
        (field as CmdbModels.ModelObjectRelation).left_tags.length === 0 &&
        !(field as CmdbModels.ModelObjectRelation).left_groups?.includes(
          BASIC_INFORMATION_RELATION_GROUP_ID
        )
      ) {
        return false;
      }
      return (
        !field.__isRelation ||
        // 分组中有什么关系就显示什么关系
        modelData.view.attr_category_order.includes(
          (field as CmdbModels.ModelObjectRelation).left_tags[0]
        ) ||
        modelData.view.attr_category_order.includes(DEFAULT_ATTRIBUTE_TAG_STR)
      );
    }

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
            if (matched && attrFilter(matched)) {
              return matched;
            }
          })
          .filter((attr) => attr);
      } else {
        basicInfoAttrList = modelData.__fieldList.filter((field) =>
          attrFilter(field)
        );
      }
      basicInfoAttrList.forEach((field) => {
        let groupTag: string;
        const nameKey = getInstanceNameKeys(modelData)[0];
        if (field.__isRelation) {
          groupTag =
            field.left_tags?.length && field.left_tags[0].trim() !== ""
              ? field.left_tags[0]
              : DEFAULT_ATTRIBUTE_TAG;
        } else {
          const basicInfoText = i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.BASIC_INFORMATION}`
          );
          groupTag =
            field.tag.length > 0
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

    this.setState({
      basicInfoGroupList,
      basicInfoGroupListShow: basicInfoGroupList,
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
  async fetchData(props: LegacyInstanceDetailProps): Promise<void> {
    let modelListData,
      modelDataMap,
      modelData: Partial<CmdbModels.ModelCmdbObject>,
      instanceData,
      filterModelData,
      hideModelData: string[];
    try {
      if (props.modelDataList) {
        modelDataMap = keyBy(props.modelDataList, "objectId");
        instanceData = await fetchCmdbInstanceDetail(
          props.objectId,
          props.instanceId
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
      modelData = modelDataMap[props.objectId];
      hideModelData = modelData.view.hide_columns || [];
      filterModelData = {
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

  isRelation(attr: any) {
    return attr.value?.type === "FK" || attr.value?.type === "FKs";
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
