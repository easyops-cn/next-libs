import React from "react";
import { DownOutlined, InfoCircleFilled } from "@ant-design/icons";
import { Card, Popover, Spin, Button, Menu, Dropdown } from "antd";
import { withTranslation, WithTranslation } from "react-i18next";
import {
  get,
  isNil,
  mapValues,
  isObject,
  isString,
  cloneDeep,
  map,
  compact,
} from "lodash";
import { handleHttpError, BrickAsComponent } from "@easyops/brick-kit";
import {
  AttributeConfig,
  CustomBrickConfig,
  CustomDisplay,
  InstanceDisplay,
  BrickAction,
} from "@easyops/brick-types";
import { getInstanceNameKeys, IGNORED_FIELDS } from "@libs/cmdb-utils";
import { CmdbModels } from "@sdk/cmdb-sdk";
import { Link } from "@libs/basic-components";
import { StructTable } from "../struct-components/StructTable";
import { FieldsByTag } from "../model-attribute-form/ModelAttributeForm";
import { InstanceFormat } from "../components";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import style from "./index.module.css";
import shared from "./shared.module.css";

import {
  fetchCmdbObjectDetail,
  fetchCmdbInstanceDetail,
} from "../data-providers";
import { BASIC_INFORMATION_RELATION_GROUP_ID } from "./constants";
import { isArray } from "util";
import { UseBrickConf } from "@easyops/brick-types";

export interface AttrCustomConfigs {
  [attrId: string]: LegacyCustomComponent;
}

export interface LegacyCustomComponent {
  component?: {
    brick: string;
    field?: keyof LegacyInstanceDetailState;
    properties: Record<string, any>;
  };
  useBrick?: UseBrickConf;
}

interface LegacyInstanceDetailProps extends WithTranslation {
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
}

interface LegacyInstanceDetailState {
  modelData: {
    attrList?: any[];
    objectId?: string;
  };
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
      modelData: null,
      instanceData: null,
      helpTips: [
        {
          value: "creator",
          label: "创建者",
        },
        {
          value: "ctime",
          label: "创建时间",
        },
        {
          value: "modifier",
          label: "修改者",
        },
        {
          value: "mtime",
          label: "修改时间",
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
        基本信息
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
              更多 <DownOutlined />
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

  getAttrListNode(attr: any): React.ReactNode {
    const { isStruct, isStructs, isRelation, isMarkdownField } = this;
    const { modelData, instanceData } = this.state;
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
          const field: keyof LegacyInstanceDetailState =
            attrCustomConfig.component.field || "instanceData";
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
          {attr.name}:
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
                {...{
                  target: "blank",
                  ref: (el: any) => {
                    el &&
                      Object.assign(el, {
                        ...attrCustomConfig.component.properties,
                      });
                  },
                }}
              />
            ))}
          {!isStructs(attr) &&
            !isStruct(attr) &&
            !isRelation(attr) &&
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

  setBasicInfoGroupList(state: LegacyInstanceDetailState) {
    let { modelData, basicInfoGroupList } = state;
    const { attributeKeys, fieldsByTag } = this.props;
    let basicInfoAttrList: any[];
    function attrFilter(attr: any): boolean {
      if (IGNORED_FIELDS[modelData.objectId]?.includes(attr.id)) {
        return false;
      }
      return (
        !["FK", "FKs"].includes(attr.value.type) ||
        (attr.id === attr.left_id
          ? attr.left_groups?.includes(BASIC_INFORMATION_RELATION_GROUP_ID)
          : attr.right_groups?.includes(BASIC_INFORMATION_RELATION_GROUP_ID))
      );
    }

    basicInfoGroupList = [];

    if (fieldsByTag) {
      basicInfoGroupList = map(fieldsByTag, (tag) => {
        const attrList = compact(
          map(tag.fields, (attr) => {
            const matched = modelData.attrList.find((item) => item.id === attr);
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
            const matched = modelData.attrList.find((item) => item.id === attr);
            if (matched && attrFilter(matched)) {
              return matched;
            }
          })
          .filter((attr) => attr);
      } else {
        basicInfoAttrList = modelData.attrList.filter((attr: any) =>
          attrFilter(attr)
        );
      }

      basicInfoAttrList.forEach((basicInfoAttr) => {
        let groupTag: string;
        const nameKey = getInstanceNameKeys(modelData)[0];
        if (!["FK", "FKs"].includes(basicInfoAttr.value.type)) {
          groupTag =
            basicInfoAttr.tag.length > 0
              ? basicInfoAttr.tag[0] || "基本信息"
              : "基本信息";
        } else if (basicInfoAttr.id === basicInfoAttr.left_id) {
          groupTag =
            basicInfoAttr.left_tags?.length &&
            basicInfoAttr.left_tags[0].trim() !== ""
              ? basicInfoAttr.left_tags[0]
              : "默认属性";
        } else {
          groupTag =
            basicInfoAttr.right_tags?.length &&
            basicInfoAttr.right_tags[0].trim() !== ""
              ? basicInfoAttr.right_tags[0]
              : "默认属性";
        }

        const basicInfoGroup = basicInfoGroupList.find(
          (item: any) => item.name === groupTag
        );

        if (basicInfoGroup) {
          basicInfoAttr.id === nameKey
            ? basicInfoGroup["attrList"].unshift(basicInfoAttr)
            : basicInfoGroup["attrList"].push(basicInfoAttr);
        } else {
          basicInfoGroupList.push({
            name: groupTag,
            active: false,
            attrList: [basicInfoAttr],
          });
        }
      });
    }

    this.setState({
      basicInfoGroupList,
      basicInfoGroupListShow: basicInfoGroupList,
    });
  }
  async componentDidUpdate(
    prevProps: LegacyInstanceDetailProps
  ): Promise<void> {
    if (
      this.props.objectId &&
      this.props.instanceId &&
      prevProps.instanceId !== this.props.instanceId
    ) {
      await this.fetchData();
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
      await this.fetchData();
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

  async fetchData(): Promise<void> {
    try {
      const [modelData, instanceData] = await Promise.all([
        fetchCmdbObjectDetail(this.props.objectId),
        fetchCmdbInstanceDetail(this.props.objectId, this.props.instanceId),
      ]);
      this.setState({
        instanceData,
        modelData,
        loaded: true,
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
