import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Checkbox,
  Switch,
  Alert,
  Radio,
  Row,
  Col,
  Tooltip,
} from "antd";
import { SelectUserOrGroup } from "./SelectUserOrGroup";
import { initPermissionOptions } from "../processors";
import { KEY_AUTHORIZERS_OF_PERM } from "../constants";
import styles from "./index.module.css";
import { LabeledValue } from "antd/lib/select";
import i18next from "i18next";
import { NS_LIBS_PERMISSION, K } from "../i18n/constants";
import { addResourceBundle } from "../i18n";

addResourceBundle();
export interface BatchSettingProps {
  modelData?: any;
  instanceIds: string[];
  permissionList: any;
  updateFunction(data: {
    authorizers: string[];
    method: string;
    permissions: [];
    packageIds: string[];
  }): void;
}
export interface BatchSettingState {
  visible: boolean;
  formData: {
    authorizers: string[];
    perm: [];
    enableWhiteList: boolean;
    method: string;
  };
}
export class BatchSetting extends React.Component<
  BatchSettingProps,
  BatchSettingState
> {
  constructor(props: BatchSettingProps) {
    super(props);
    this.state = {
      visible: false,
      formData: {
        enableWhiteList: false,
        method: "overwrite",
        authorizers: [],
        perm: [],
      },
    };
  }
  // 弹出
  showModal = () => {
    this.setState({ visible: true });
  };
  handleOk = () => {
    const packageIds = this.props.instanceIds;
    const { authorizers, method, perm: permissions } = this.state.formData;
    this.props.updateFunction({ authorizers, method, permissions, packageIds });
    this.handleCancel();
  };
  handleCancel = () => {
    this.setState((prevState: BatchSettingState) => ({
      visible: false,
      formData: {
        ...prevState.formData,
        enableWhiteList: false,
      },
    }));
  };
  handleSwitchWhiteList = (checked: boolean) => {
    this.setState((prevState: BatchSettingState) => ({
      formData: {
        ...prevState.formData,
        enableWhiteList: true,
      },
    }));
  };
  handleUsersChange = (value: LabeledValue[]) => {
    const authorizers = value.map((item) => item.label) as string[];
    this.setState((prevState: BatchSettingState) => ({
      formData: { ...prevState.formData, authorizers },
    }));
  };
  handleChangeAction = (e: any) => {
    this.setState((prevState: BatchSettingState) => ({
      formData: { ...prevState.formData, method: e.target.value },
    }));
  };
  handleCheckPerm = (checkedValue: any) => {
    this.setState((prevState: BatchSettingState) => ({
      formData: { ...prevState.formData, perm: checkedValue },
    }));
  };
  renderWhiteListForm() {
    const RadioGroup = Radio.Group;
    const RadioButton = Radio.Button;
    const method = this.state.formData.method;
    const operations = [
      {
        label: i18next.t(`${NS_LIBS_PERMISSION}:${K.RESET}`, "重置"),
        value: "overwrite",
        message: i18next.t(
          `${NS_LIBS_PERMISSION}:${K.RESET_WHITELIST_TO}`,
          "重置白名单为："
        ),
      },
      {
        label: i18next.t(`${NS_LIBS_PERMISSION}:${K.ADD}`, "添加"),
        value: "append",
        message: i18next.t(
          `${NS_LIBS_PERMISSION}:${K.ADD_TO_WHITELIST}`,
          "向白名单添加："
        ),
      },
      {
        label: i18next.t(`${NS_LIBS_PERMISSION}:${K.REMOVE}`, "移除"),
        value: "remove",
        message: i18next.t(
          `${NS_LIBS_PERMISSION}:${K.REMOVE_FROM_WHITELIST}`,
          "从白名单移除："
        ),
      },
    ];
    const message = operations.find((item) => item.value === method).message;

    return (
      <div className={styles.whiteListFormContainer}>
        <div>
          <RadioGroup
            onChange={this.handleChangeAction}
            defaultValue="overwrite"
          >
            {operations.map((operation) => (
              <RadioButton value={operation.value} key={operation.value}>
                {operation.label}
              </RadioButton>
            ))}
          </RadioGroup>
        </div>
        <div className={styles.subFormRow}>
          <label className={styles.subFormLabel}>{message}</label>
          <div>
            <SelectUserOrGroup handleUsersChange={this.handleUsersChange} />
          </div>
        </div>
      </div>
    );
  }
  formIsValid = () => {
    const { perm, enableWhiteList, authorizers } = this.state.formData;
    return perm.length && (!enableWhiteList || authorizers.length);
  };
  render(): React.ReactNode {
    let { modelData, instanceIds } = this.props;
    if (!instanceIds) {
      instanceIds = [];
    }
    const permissionOptions = initPermissionOptions(this.props.permissionList);
    const CheckboxGroup = Checkbox.Group;
    const whiteListForm = this.renderWhiteListForm();
    return (
      <div>
        <Button onClick={this.showModal} disabled={!instanceIds.length}>
          {i18next.t(
            `${NS_LIBS_PERMISSION}:${K.BATCH_SET_PERMISSION}`,
            "批量设置权限"
          )}
        </Button>
        <Modal
          title={i18next.t(
            `${NS_LIBS_PERMISSION}:${K.BATCH_SET_PERMISSION}`,
            "批量设置权限"
          )}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText={i18next.t(`${NS_LIBS_PERMISSION}:${K.CONFIRM}`, "确定")}
          cancelText={i18next.t(`${NS_LIBS_PERMISSION}:${K.CANCEL}`, "取消")}
          okButtonProps={{ disabled: !this.formIsValid() }}
          destroyOnClose={true}
        >
          <Alert
            message={`${i18next.t(
              `${NS_LIBS_PERMISSION}:${K.SELECTED}`,
              "已选择"
            )}${instanceIds.length}${i18next.t(
              `${NS_LIBS_PERMISSION}:${K.ITEMS}`,
              "个"
            )}${
              modelData
                ? modelData.name
                : i18next.t(`${NS_LIBS_PERMISSION}:${K.PACKAGE}`, "程序包")
            }`}
            type="info"
          />
          <div className={styles.formContainer}>
            <div className={styles.formRow}>
              <label
                className={`ant-legacy-form-item-required ${styles.formLabel}`}
              >
                {i18next.t(
                  `${NS_LIBS_PERMISSION}:${K.SELECT_PERMISSIONS}`,
                  "选择权限："
                )}
              </label>
              <CheckboxGroup
                options={permissionOptions}
                onChange={this.handleCheckPerm}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>
                {i18next.t(`${NS_LIBS_PERMISSION}:${K.WHITELIST}`, "白名单：")}
              </label>
              <div>
                <Switch
                  defaultChecked={false}
                  onChange={this.handleSwitchWhiteList}
                />
                {this.state.formData.enableWhiteList ? whiteListForm : null}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
