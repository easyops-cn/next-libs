import React, { Component, FormEvent } from "react";
import { Form } from "@ant-design/compatible";
import { Button, Checkbox, Collapse, Tooltip } from "antd";
import { ButtonType } from "antd/lib/button";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { UploadConfig } from "../components/cmdb-upload";
import {
  CmdbModels,
  InstanceApi_GetDefaultValueTemplateResponseBody,
  InstanceApi_GetDetailResponseBody,
  CmdbObjectApi_getObjectRef,
} from "@next-sdk/cmdb-sdk";
import {
  FormComponentProps,
  FormItemProps,
  ValidationRule,
} from "@ant-design/compatible/lib/form";
import {
  FormControlTypeEnum,
  ModelAttributeFormControl,
  ModelAttributeValueType,
} from "../model-attribute-form-control/ModelAttributeFormControl";
import { AttributeFormControlUrl } from "../attribute-form-control-url/AttributeFormControlUrl";
import _, { get, isNil, keyBy, pickBy, compact } from "lodash";

import { CmdbInstancesSelectPanel } from "../cmdb-instances-select-panel/CmdbInstancesSelectPanel";
import {
  ModifiedModelCmdbObject,
  ModifiedModelObjectAttr,
  ModifiedModelObjectField,
  ModifiedModelObjectRelation,
  modifyModelData,
  getFixedStyle,
} from "@next-libs/cmdb-utils";
import styles from "./ModelAttributeForm.module.css";
import { UserOrUserGroupSelect } from "../components";
import { permissionListMapOfApp } from "./constants";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { ATTRIBUTE_ID_PREFIX } from "../processors";
import i18next from "i18next";

const t = i18next.getFixedT(null, NS_LIBS_CMDB_INSTANCES);
const DEFAULT_ATTRIBUTE_TAG = t(K.BASIC_INFORMATION);

export interface ModelAttributeFormChildren {
  header: string;
  name: string;
  label: string;
  options?: { [key: string]: any };
}

export interface FieldsByTag {
  name: string;
  fields: string[];
}

interface ModelAttributeFormProps extends FormComponentProps {
  isCreate?: boolean;
  disabled?: boolean;
  objectId?: string;
  allowContinueCreate?: boolean;
  blackList?: string[]; // 黑名单
  brickList?: ModelAttributeFormChildren[];
  fieldsByTag?: FieldsByTag[];
  formItemProps?: FormItemProps;
  onSubmit(data: any): Promise<any>;
  basicInfoAttrList?: Partial<CmdbModels.ModelObjectAttr>[];
  objectList?: Partial<CmdbModels.ModelCmdbObject>[];
  modelRelations?: Partial<CmdbModels.ModelCmdbObject>[];
  modelData?: Partial<CmdbModels.ModelCmdbObject>;
  attributeFormControlInitialValueMap:
    | InstanceApi_GetDefaultValueTemplateResponseBody
    | Partial<InstanceApi_GetDetailResponseBody>;
  showCancelButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  cancelType?: ButtonType;
  onCancel?(): void;
  showDetailUrl?: boolean;
  isFilterView?: boolean;
  objectListOfUser?: Partial<CmdbModels.ModelCmdbObject>[];
  permissionList?: Record<string, any>[];
  enabledWhiteList?: boolean;
  scrollToFirstError?: boolean;
  offsetTop?: number;
  offsetBottom?: number;
  cardRect?: any;
  isApprove?: boolean;
  hasRelateId?: boolean;
  defaultUserOrUserGroup?: {
    selectedUser?: string[];
    selectedUserGroup?: string[];
  };
  isResetInstanceNameWhenSaveAndContinueToAddInstance?: boolean;
  uploadConfig?: UploadConfig;
  useManualVerification?: boolean;
  ref?: any;
}

export type attributesFieldsByTag = [string, ModifiedModelObjectField[]];

const RefCmdbInstancesSelectPanel = React.forwardRef(CmdbInstancesSelectPanel);
interface ModelAttributeFormState {
  sending: boolean;
  attrListGroupByTag: attributesFieldsByTag[];
  continueCreating: boolean;
  showError?: Record<string, any>;
  fixedStyle?: Record<string, any>;
  defaultValueTemplateIndex?: number;
}

export class ModelAttributeForm extends Component<
  ModelAttributeFormProps,
  ModelAttributeFormState
> {
  private modelMap: Record<string, Partial<CmdbModels.ModelCmdbObject>> = {};
  private modelData: Partial<CmdbModels.ModelCmdbObject> = null;
  private cardRectResize: ResizeObserver;
  static defaultProps = {
    showCancelButton: true,
    cancelType: "text" as ButtonType,
  };

  formItemProps: FormItemProps =
    document.querySelector("html")?.getAttribute("data-ui") === "v8-2"
      ? {
          labelCol: { span: 24 },
          wrapperCol: { span: 24 },
        }
      : {
          labelCol: { span: 6 },
          wrapperCol: { span: 18 },
        };

  getFeildTag(field: any) {
    return (
      field?.tag?.[0] ||
      (field as any)?.left_tags?.[0] ||
      (field?.__isRelation ? "" : DEFAULT_ATTRIBUTE_TAG)
    );
  }

  constructor(props: ModelAttributeFormProps) {
    super(props);
    if (this.props.objectList) {
      this.modelMap = keyBy(this.props.objectList, "objectId");
    }
    // istanbul ignore else
    if (this.props.modelData) {
      this.modelData = modifyModelData(this.props.modelData);
    } else {
      if (this.props.objectList) {
        this.modelData = modifyModelData(this.modelMap[this.props.objectId]);
      }
    }

    const hideModelData: string[] = this.modelData.view.hide_columns || [];
    let AttrListGroupByTag: attributesFieldsByTag[] = [];
    let fieldsByTag;
    if (props.formItemProps) {
      this.formItemProps = props.formItemProps;
    }
    if (props.fieldsByTag) {
      fieldsByTag = this.props.fieldsByTag.map((items) => {
        let fields;
        if (items.fields) {
          fields = items.fields.filter(
            (item) => item && !hideModelData.includes(item)
          );
        }
        return {
          name: items.name,
          fields,
        };
      });
      AttrListGroupByTag = ModelAttributeForm.getFieldsByTag(
        this.props.basicInfoAttrList,
        fieldsByTag,
        this.modelData
      );
    } else {
      props.basicInfoAttrList.forEach((basicInfoAttr: any) => {
        const groupTag = this.getFeildTag(basicInfoAttr);
        // 关系的情况下，为了避免在模型管理的视图里删除后还会在编辑里出现，去掉默认分组

        const attrs = AttrListGroupByTag.find(([key]) => key === groupTag);
        // 判断是否为黑名单内的属性
        if (
          isNil(props.blackList) ||
          !props.blackList.includes(basicInfoAttr.id)
        ) {
          if (attrs) {
            attrs[1].push(basicInfoAttr);
          } else {
            AttrListGroupByTag.push([groupTag, [basicInfoAttr]]);
          }
        }
      });
      // 用于处理分类排序失效的问题
      const attrCategoryOrder = this.modelData?.view?.attr_category_order || [];
      AttrListGroupByTag = attrCategoryOrder?.length
        ? compact(
            attrCategoryOrder.map((v) =>
              AttrListGroupByTag.find(([key]) => key === v)
            )
          )
        : AttrListGroupByTag;
    }

    this.state = {
      sending: false,
      attrListGroupByTag: AttrListGroupByTag,
      continueCreating: false,
      showError: {},
      fixedStyle: {},
      defaultValueTemplateIndex: 1,
    };
  }

  resizeUpdate = () =>
    this.setState({
      fixedStyle: getFixedStyle(this.props.cardRect?.getBoundingClientRect()),
    });
  handleResize = (): void => {
    const cardRectData = this.props.cardRect?.getBoundingClientRect();
    const heightDifferenceBetweenCardRectAndViewPort =
      cardRectData?.top > 0
        ? cardRectData?.bottom - window.innerHeight
        : cardRectData?.height - window.innerHeight;
    if (
      heightDifferenceBetweenCardRectAndViewPort < 0 &&
      !!Object.keys(this.state.fixedStyle).length
    ) {
      this.setState({ fixedStyle: {} });
    } else if (
      heightDifferenceBetweenCardRectAndViewPort > 0 ||
      document.querySelector("html")?.getAttribute("data-ui") === "v8-2"
    ) {
      this.resizeUpdate();
    }
  };
  componentDidMount(): void {
    if (this.props.cardRect) {
      this.cardRectResize = new ResizeObserver(this.handleResize);
      this.cardRectResize.observe(this.props.cardRect);
    }
    const top =
      this.props.cardRect?.getBoundingClientRect()?.bottom - window.innerHeight;
    if (top > 0) {
      this.setState({
        fixedStyle: getFixedStyle(this.props.cardRect?.getBoundingClientRect()),
      });
    }
    this.props.cardRect && window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    // 离开页面时移除监听事件
    window.removeEventListener("resize", this.handleResize);
    this.cardRectResize?.disconnect();
  }

  static getDerivedStateFromProps(props: any, state: any): any {
    if (props.defaultValueTemplateIndex !== state.defaultValueTemplateIndex) {
      props.form.setFieldsValue({
        ...props.form.getFieldsValue(),
        ...pickBy(props.attributeFormControlInitialValueMap),
      });
      return {
        defaultValueTemplateIndex: props.defaultValueTemplateIndex,
      };
    }
    return null;
  }

  static getFieldsByTag(
    attributeList: Partial<CmdbModels.ModelObjectAttr>[],
    fieldsByTag: FieldsByTag[],
    modelData?: Partial<ModifiedModelCmdbObject>
  ): attributesFieldsByTag[] {
    const map = new Map<string, Partial<CmdbModels.ModelObjectAttr>[]>([]);

    fieldsByTag.forEach(({ name, fields }) => {
      if (!map.has(name)) {
        map.set(name, []);
        fields.forEach((field) => {
          const appendAttr = modelData
            ? modelData.__fieldList.find((__field) => __field.__id === field)
            : attributeList.find(({ id }) => id === field);
          if (appendAttr !== undefined) {
            map.set(name, [...map.get(name), appendAttr]);
          }
        });
      }
    });

    return Array.from(map);
  }

  static sortAttributeList(
    attributeList: { [s: string]: Partial<CmdbModels.ModelObjectAttr>[] },
    tagList: { [s: string]: string[] }
  ): { [s: string]: Partial<CmdbModels.ModelObjectAttr>[] } {
    const store: { [s: string]: Partial<CmdbModels.ModelObjectAttr>[] } = {};
    /* istanbul ignore next */
    for (const tag in tagList) {
      if (!store[tag]) {
        store[tag] = [];
      }

      tagList[tag].forEach((prop) => {
        const result = attributeList[tag].find((v) => v.id === prop);
        store[tag].push(result);
      });
    }

    return store;
  }

  handleFormErrors(fieldsError: Record<string, string[] | undefined>) {
    return Object.keys(fieldsError).some((field) => fieldsError[field]);
  }
  permissionAttrProcess = (key: string) => {
    if (key.includes("instance_access")) return "readAuthorizers";
    if (key.includes("instance_delete")) return "deleteAuthorizers";
    if (key.includes("instance_update")) return "updateAuthorizers";
    // HOST特有
    if (key.includes("instance_operate")) return "operateAuthorizers";
    // APP特有
    return permissionListMapOfApp[key] || key;
  };

  valuesProcess = (values: Record<string, any>) => {
    const appPermissionAuthorizers: Record<string, any> = {};
    Object.values(permissionListMapOfApp).forEach((r) => {
      appPermissionAuthorizers[r] = values[r]
        ? values[r].selectedUser.concat(values[r].selectedUserGroup)
        : [];
    });
    return {
      ...values,
      deleteAuthorizers: values.deleteAuthorizers
        ? values.deleteAuthorizers.selectedUser.concat(
            values.deleteAuthorizers.selectedUserGroup
          )
        : [],
      readAuthorizers: values.readAuthorizers
        ? values.readAuthorizers.selectedUser.concat(
            values.readAuthorizers.selectedUserGroup
          )
        : [],
      updateAuthorizers: values.updateAuthorizers
        ? values.updateAuthorizers.selectedUser.concat(
            values.updateAuthorizers.selectedUserGroup
          )
        : [],
      ...(this.props.objectId === "HOST"
        ? {
            operateAuthorizers: values.operateAuthorizers
              ? values.operateAuthorizers.selectedUser.concat(
                  values.operateAuthorizers.selectedUserGroup
                )
              : [],
          }
        : {}),
      ...(this.props.objectId === "APP" ? appPermissionAuthorizers : {}),
    };
  };
  /* istanbul ignore next */
  validateFieldsCallback = async (err: any, values: any, type?: string) => {
    if (!err) {
      const { continueCreating } = this.state;
      this.setState({ sending: true });
      const actualValues = Object.fromEntries(
        Object.entries(values).map(([attrId, value]) => [
          attrId.replace(ATTRIBUTE_ID_PREFIX, ""),
          value,
        ])
      );

      const result = await this.props.onSubmit({
        continueCreating,
        values:
          this.props.enabledWhiteList && this.props.permissionList
            ? this.valuesProcess(actualValues)
            : actualValues,
        type,
      });
      if (result !== "error" && continueCreating) {
        this.props.form.resetFields();
      }
      if (result === "error") {
        this.setState({ sending: false });
      }
      if (result !== "error" && type === "continue") {
        // istanbul ignore if
        if (this.props.isResetInstanceNameWhenSaveAndContinueToAddInstance) {
          this.props.form.resetFields([ATTRIBUTE_ID_PREFIX + "name"]);
        }
        setTimeout(() => {
          this.setState({ sending: false });
        }, 2500);
      }
    }
  };
  /* istanbul ignore next */
  public handleSubmit = (e?: FormEvent, type?: string) => {
    // 允许不传入 event 参数
    if (e) {
      e.preventDefault();
    }

    this.props.scrollToFirstError
      ? this.props.form.validateFieldsAndScroll(
          {
            scroll: {
              offsetTop: this.props.offsetTop || 60,
              offsetBottom: this.props.offsetBottom || 100,
            },
          },
          async (err, values) => {
            await this.validateFieldsCallback(err, values, type);
          }
        )
      : this.props.form.validateFields(async (err, values) => {
          await this.validateFieldsCallback(err, values, type);
        });
  };

  get disabled(): boolean {
    const { sending } = this.state;
    // const { getFieldsError } = this.props.form;
    return sending;
  }

  // get submitBtnText() {
  //   return this.props.isCreate
  //     ? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE}`)
  //     : i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MODIFICATION}`);
  // }

  static tagsValidator(
    attribute: Partial<CmdbModels.ModelObjectAttr>
  ): (rule: any, value: string[], callback: (msg?: string) => void) => void {
    return (rule: any, value: string[], callback: (msg?: string) => void) => {
      if (!value) {
        return callback();
      }
      if (!Array.isArray(value)) {
        return callback(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_MEET_REGEX}`)
        );
      }

      const isValidAll = value.every((v) =>
        ModelAttributeFormControl.computePattern(attribute).test(v)
      );

      isValidAll
        ? callback()
        : callback(i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_MEET_REGEX}`));
    };
  }

  static urlValidator(
    attribute: Partial<CmdbModels.ModelObjectAttr>
  ): (rule: any, value: string, callback: (msg?: string) => void) => void {
    return (rule: any, value: string, callback: (msg?: string) => void) => {
      const { url } = AttributeFormControlUrl.breakDownValue(value);
      ModelAttributeFormControl.computePattern(attribute)?.test(url)
        ? callback()
        : callback(i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_MEET_REGEX}`));
    };
  }

  // 关联模型form的rules
  relationRules(
    attribute: Partial<ModifiedModelObjectRelation>
  ): ValidationRule[] {
    const { left_required: leftRequired } = attribute;
    // 获取validationRule规则
    const getRules = (required: boolean, name: string): ValidationRule[] => {
      const requireRule = {
        required,
        message: i18n.t(
          `${NS_LIBS_CMDB_INSTANCES}:${K.ATTRIBUTE_NAME_REQUIRED}`,
          { attribute_name: name }
        ),
      };
      return [requireRule];
    };

    if (leftRequired) {
      return getRules(leftRequired, attribute.right_description);
    }

    return [];
  }

  rules(attribute: Partial<CmdbModels.ModelObjectAttr>): ValidationRule[] {
    // historical issues：  如果是INTEGER和URL类型暂时不用正则表达式验证
    const required = attribute.required !== "false";
    const requiredRule = [
      ModelAttributeValueType.IP,
      ModelAttributeValueType.STRING,
      ModelAttributeValueType.JSON,
    ].includes(attribute.value.type as ModelAttributeValueType)
      ? {
          required,
          whitespace: required,
          message: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.ATTRIBUTE_NAME_REQUIRED}`,
            { attribute_name: attribute.name }
          ),
        }
      : {
          required,
          message: i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.ATTRIBUTE_NAME_REQUIRED}`,
            { attribute_name: attribute.name }
          ),
        };
    try {
      const type = ModelAttributeFormControl.computeFormControlType(attribute);
      if (
        attribute.value.regex === null ||
        attribute.value.type === ModelAttributeValueType.INTEGER ||
        attribute.value.type === ModelAttributeValueType.ENUMS
      ) {
        return [requiredRule];
      }

      if (type === FormControlTypeEnum.URL) {
        // poc需求 内置函数-自定义模板时不校验
        return attribute.value?.default === "template()" &&
          attribute.value?.default_type === "function"
          ? null
          : [
              requiredRule,
              { validator: ModelAttributeForm.urlValidator(attribute) },
            ];
      }

      if (type === FormControlTypeEnum.TAGS) {
        return [
          requiredRule,
          { validator: ModelAttributeForm.tagsValidator(attribute) },
        ];
      }

      return [
        requiredRule,
        {
          pattern: ModelAttributeFormControl.computePattern(attribute),
          message: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_MEET_REGEX}`),
        },
      ];
    } catch (error) {
      // 例如无枚举值、结构体未添加字段等
      return [requiredRule];
    }
  }

  handleCheckContinueCreating = (e: any) => {
    this.setState({ continueCreating: e.target.checked });
  };

  renderRelationFormControl = (
    relation: Partial<ModifiedModelObjectRelation>
  ) => {
    const InitialRelationValue = get(
      this.props.attributeFormControlInitialValueMap,
      relation.left_id
    );
    const initialValue = InitialRelationValue
      ? InitialRelationValue.map((instanceData: any) => instanceData.instanceId)
      : [];

    // 用于获取与当前模型相关联的模型
    const objectRelations = (this.props.modelRelations || []).filter((v) => {
      const index = v.relation_list.findIndex(
        (_relation) =>
          _relation.left_object_id === relation.right_object_id ||
          _relation.right_object_id === relation.right_object_id
      );
      return index > -1;
    });

    return (
      <Form.Item
        label={relation.left_name}
        key={relation.left_id}
        {...this.formItemProps}
      >
        {this.props.form.getFieldDecorator(relation.left_id, {
          rules: this.relationRules(relation),
          initialValue,
        })(
          <RefCmdbInstancesSelectPanel
            {...(this.props.modelRelations
              ? { objectMap: keyBy(objectRelations, "objectId") }
              : {})}
            isFilterView={this.props.isFilterView}
            modelData={this.modelMap[relation.right_object_id]}
            objectId={relation.right_object_id}
            addTitle={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ADD}`)}
            singleSelect={relation.left_max === 1}
            isOperate={true}
            showDetailUrl={this.props.showDetailUrl}
            relation={relation}
            showSizeChanger={true}
            showPagination={true}
          />
        )}
      </Form.Item>
    );
  };

  handleCancel = () => {
    this.setState({ sending: true });
    this.props.onCancel?.();
  };

  render(): React.ReactNode {
    const Panel = Collapse.Panel;
    const {
      form,
      attributeFormControlInitialValueMap,
      brickList,
      allowContinueCreate,
      showCancelButton,
      cancelText,
      confirmText,
      cancelType,
      defaultUserOrUserGroup,
    } = this.props;
    const { getFieldDecorator } = form;

    let defaultActiveKey = this.state.attrListGroupByTag.map(([key]) => key);

    if (Array.isArray(brickList)) {
      defaultActiveKey = [
        ...defaultActiveKey,
        ...brickList.map((brick) => brick.name),
      ];
    }
    if (defaultUserOrUserGroup) {
      defaultActiveKey = [...defaultActiveKey, "permission"];
    }
    const collapse = this.state.attrListGroupByTag && (
      <Collapse
        bordered={false}
        defaultActiveKey={defaultActiveKey}
        className={styles.collapseStyle}
      >
        {this.state.attrListGroupByTag.map(([tag, list]) => (
          <Panel header={tag} key={tag} forceRender={true}>
            {list.map((attribute, index) => {
              if (attribute.__isRelation) {
                return this.renderRelationFormControl(attribute);
              } else if (attribute.__isRelation === false) {
                return (
                  <Form.Item
                    label={
                      <span>
                        <span>{attribute.name}</span>
                        {attribute.description &&
                          attribute.description !== "" && (
                            <Tooltip title={attribute.description}>
                              <ExclamationCircleFilled
                                style={{
                                  padding: "0 2px",
                                  color: "var(--color-secondary-text)",
                                }}
                              />
                            </Tooltip>
                          )}
                      </span>
                    }
                    key={attribute.name}
                    {...this.formItemProps}
                  >
                    {getFieldDecorator(
                      `${ATTRIBUTE_ID_PREFIX + attribute.id}`,
                      {
                        rules: this.rules(attribute),
                        //默认值为string，但是新建时接口转成了object，故编辑时后台返回的也是object
                        initialValue:
                          attribute.value.type === "json" &&
                          !_.isString(
                            attributeFormControlInitialValueMap[attribute.id]
                          )
                            ? JSON.stringify(
                                attributeFormControlInitialValueMap[
                                  attribute.id
                                ],
                                null,
                                2
                              )
                            : attributeFormControlInitialValueMap[attribute.id],
                      }
                    )(
                      <ModelAttributeFormControl
                        isCreate={this.props.isCreate}
                        attribute={{
                          ...attribute,
                          id: `${ATTRIBUTE_ID_PREFIX + attribute.id}`,
                        }}
                        multiSelect={
                          attribute?.value?.type ===
                          ModelAttributeValueType.ENUMS
                        }
                        uploadConfig={this.props.uploadConfig}
                        objectId={this.props.objectId}
                        jsonValidateCollection={(err: any) => {
                          const showError = { ...this.state.showError };
                          showError[tag + index] = err;
                          this.setState({ showError });
                        }}
                        xmlValidateCollection={(err: any) => {
                          const showError = { ...this.state.showError };
                          showError[tag + index] = err;
                          this.setState({ showError });
                        }}
                      />
                    )}
                  </Form.Item>
                );
              }
            })}
          </Panel>
        ))}

        {brickList &&
          brickList.map((brick) => (
            <Panel header={brick.header} key={brick.name}>
              <Form.Item
                label={brick.label}
                key={brick.name}
                {...this.formItemProps}
              >
                <brick.name
                  ref={(element: any) => {
                    element &&
                      ((element["value"] = this.props.form.getFieldsValue()),
                      (element["options"] = brick.options));
                  }}
                />
              </Form.Item>
            </Panel>
          ))}

        {this.props.enabledWhiteList && this.props.permissionList && (
          <Panel
            header={i18n.t(
              `${NS_LIBS_CMDB_INSTANCES}:${K.PERMISSION_WHITELIST}`
            )}
            key={"permission"}
          >
            {this.props.permissionList.map((r) => {
              return (
                <Form.Item label={r.remark} key={r.id} {...this.formItemProps}>
                  {getFieldDecorator(
                    this.permissionAttrProcess(r.action) as string,
                    {
                      initialValue: defaultUserOrUserGroup,
                    }
                  )(
                    <UserOrUserGroupSelect
                      placeholder={i18n.t(
                        `${NS_LIBS_CMDB_INSTANCES}:${K.SELECT_PLACEHOLDER_TPL}`,
                        {
                          label: i18n.t(
                            `${NS_LIBS_CMDB_INSTANCES}:${K.USERS_OR_USER_GROUPS}`
                          ),
                        }
                      )}
                      objectMap={keyBy(this.props.objectListOfUser, "objectId")}
                      optionsMode="all"
                    ></UserOrUserGroupSelect>
                  )}
                </Form.Item>
              );
            })}
          </Panel>
        )}
      </Collapse>
    );
    const submitContainer = (
      <div
        className={styles.generalFormFooter}
        style={{
          paddingLeft: this.props.cardRect?.getBoundingClientRect()?.left,
          borderTop: "none",
        }}
      >
        <div className="ant-collapse-content-box">
          <Form.Item {...this.formItemProps} label="" colon={false}>
            {allowContinueCreate && (
              <Checkbox onChange={this.handleCheckContinueCreating}>
                {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATE_ANOTHER}`)}
              </Checkbox>
            )}

            <Button
              type="primary"
              onClick={(e) => this.handleSubmit(e)}
              disabled={
                this.disabled ||
                Object.values(this.state.showError).includes(true)
              }
              data-testid="submit-btn"
            >
              {confirmText ?? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE}`)}
            </Button>
            {this.props.isCreate &&
              !this.props.hasRelateId &&
              !this.props.isApprove && (
                <Button
                  onClick={(e) => this.handleSubmit(e, "continue")}
                  className={styles.submitAndContinueBtn}
                  disabled={
                    this.disabled ||
                    Object.values(this.state.showError).includes(true)
                  }
                  data-testid="submit-and-continue-btn"
                >
                  {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE_AND_CONTINUE}`)}
                </Button>
              )}
            {showCancelButton && (
              <Button
                type={cancelType}
                style={{ marginLeft: 8 }}
                onClick={this.handleCancel}
              >
                {cancelText ?? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CANCEL}`)}
              </Button>
            )}
          </Form.Item>
        </div>
      </div>
    );

    return (
      <Form>
        {collapse}
        {!this.props.useManualVerification && submitContainer}
      </Form>
    );
  }
}

export const InstanceModelAttributeForm =
  Form.create<ModelAttributeFormProps>()(ModelAttributeForm);

export const InstanceModelAttributeFormRef = React.forwardRef<
  ModelAttributeForm,
  ModelAttributeFormProps
>((props, ref) => {
  const WrappedForm = Form.create<ModelAttributeFormProps & { ref: any }>()(
    ModelAttributeForm
  ) as any;
  return <WrappedForm {...props} wrappedComponentRef={ref} />;
});
InstanceModelAttributeFormRef.displayName = "InstanceModelAttributeFormRef";
