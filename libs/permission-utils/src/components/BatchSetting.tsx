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
  handleUsersChange = (value: { key: string; label: string }[]) => {
    const authorizers = value.map(
      (item: { key: string; label: string }) => item.label
    );
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
        label: "重置",
        value: "overwrite",
        message: "重置白名单为：",
      },
      {
        label: "添加",
        value: "append",
        message: "向白名单添加：",
      },
      {
        label: "移除",
        value: "remove",
        message: "从白名单移除：",
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
          批量设置权限
        </Button>
        <Modal
          title="批量设置权限"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ disabled: !this.formIsValid() }}
          destroyOnClose={true}
        >
          <Alert
            message={`已选择${instanceIds.length}个${
              modelData ? modelData.name : "程序包"
            }`}
            type="info"
          />
          <div className={styles.formContainer}>
            <div className={styles.formRow}>
              <label
                className={`ant-legacy-form-item-required ${styles.formLabel}`}
              >
                选择权限：
              </label>
              <CheckboxGroup
                options={permissionOptions}
                onChange={this.handleCheckPerm}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>白名单：</label>
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
