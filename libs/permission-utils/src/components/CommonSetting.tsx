import React from "react";
import update from "immutability-helper";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Table, Button, Modal, Switch, Tag } from "antd";
import * as _ from "lodash";

import { Permission, User } from "../interfaces";
import { BatchHandleUser } from "./BatchHandleUser";
import { PermissionCollection } from "../processors";
import { SelectUserOrGroup } from "./SelectUserOrGroup";
import styles from "./index.module.css";
import { CmdbModels } from "@sdk/cmdb-sdk";
export interface CommonSettingPropsDefine {
  instanceData: any;
  permissionList: Permission[];
  permissionNameOfEdit?: string;
  roleList: any;
  updateFunction?(params: Record<string, any>): void;
  stateTarget?: any;
  selectedInstances?: Record<string, any>[];
  onSingleAddUserModelOpen?(props: Record<string, any>): void;
  onSingleAddUserModelClose?(): void;
}
interface CommonSettingStateDefine {
  permissionList: Permission[];
  enableEdit: boolean;
  collections: any;
  editingKey: string;
  showAddUser: boolean;
  showBatchHandleUserModal: boolean;
  batchType: string;
  currentUsers: string[];
  temporaryUsers?: string[];
  temporaryPerms?: string[];
}

export class CommonSetting extends React.Component<
  CommonSettingPropsDefine,
  CommonSettingStateDefine
> {
  constructor(props: CommonSettingPropsDefine) {
    super(props);
    this.state = {
      permissionList: props.permissionList,
      enableEdit: false,
      collections: [],
      editingKey: "1",
      showAddUser: false,
      showBatchHandleUserModal: false,
      batchType: "add",
      currentUsers: [],
      temporaryUsers: [],
      temporaryPerms: [],
    };
  }
  componentDidMount() {
    const { instanceData, permissionList } = this.props;
    const collections = new PermissionCollection(instanceData, permissionList);
    this.setState({ collections });
    this.setState({ currentUsers: collections.getCurrentUsers() });
  }
  componentDidUpdate(prevProps: CommonSettingPropsDefine) {
    const { instanceData, permissionList, selectedInstances } = this.props;
    if (
      !_.isEqual(instanceData, prevProps.instanceData) ||
      !_.isEqual(permissionList, prevProps.permissionList)
    ) {
      const collections = new PermissionCollection(
        instanceData,
        permissionList
      );
      this.setState({ collections });
      this.setState({ currentUsers: collections.getCurrentUsers() });
    }
    if (selectedInstances !== prevProps.selectedInstances) {
      this.setState(
        {
          temporaryUsers: selectedInstances.map((instance) => instance.name),
        },
        () => {
          this.handleUsersChange();
          if (this.props.onSingleAddUserModelClose) {
            this.props.onSingleAddUserModelClose();
          }
        }
      );
    }
  }
  render() {
    const modifyButton = (
      <div className={styles.btnGroupContainer}>
        <Button onClick={this.enableEdit} id="modifyPermissionBtn">
          修改权限
        </Button>
      </div>
    );
    const buttonGroup = (
      <div className={styles.btnGroupContainer}>
        <Button
          type="primary"
          id="storeBtn"
          onClick={this.store}
          style={{ marginRight: "8px" }}
        >
          保存
        </Button>
        <Button
          id="cancelEditBtn"
          onClick={this.cancelEdit}
          style={{ marginRight: "16px" }}
        >
          取消
        </Button>
        <Button
          style={{ marginRight: "8px" }}
          id="batchAddBtn"
          icon={<PlusOutlined />}
          onClick={() => this.openBatchSetUserModel("add")}
        >
          批量添加
        </Button>
        <Button
          id="batchRemoveBtn"
          icon={<DeleteOutlined />}
          onClick={() => this.openBatchSetUserModel("remove")}
        >
          批量删除
        </Button>
      </div>
    );
    const columns = [
      {
        title: "权限名称",
        dataIndex: ["data", "remark"],
      },
      {
        title: "适用角色",
        dataIndex: ["data", "roles"],
        render: this.renderRoles,
      },
      {
        title: "启用白名单",
        dataIndex: "_whiteListEnabled",
        render: this.renderWhiteListEnabled,
      },
      {
        title: "操作",
        dataIndex: "operation",
        render: this.renderOperation,
      },
      {
        title: "用户组／用户",
        dataIndex: "authorizers",
        render: (text: any, record: any) => {
          return record._whiteListEnabled
            ? text.map((item: any) => (
                <Tag
                  color="blue"
                  key={item}
                  closable={this.state.enableEdit}
                  onClose={(e: Event) => this.removeUser(e, item, record)}
                >
                  {item}
                </Tag>
              ))
            : null;
        },
      },
    ];
    const {
      collections,
      showAddUser,
      enableEdit,
      batchType,
      showBatchHandleUserModal,
      currentUsers,
    } = this.state;
    return (
      <div className={styles.panelContainer}>
        {enableEdit ? buttonGroup : modifyButton}
        <Table columns={columns} dataSource={collections.permissionList} />
        <Modal
          destroyOnClose={true}
          title="选择用户"
          visible={showAddUser}
          onOk={this.handleStoreSingleAddUser}
          onCancel={this.closeSingleAddUserModel}
        >
          <SelectUserOrGroup handleUsersChange={this.batchHandleUserChange} />
        </Modal>
        <Modal
          destroyOnClose={true}
          title={`批量${batchType === "add" ? "添加" : "移除"}`}
          onOk={this.handleStoreBatchSetUser}
          onCancel={this.closeBatchSetUserModel}
          visible={showBatchHandleUserModal}
        >
          <BatchHandleUser
            permissionList={this.props.permissionList}
            batchType={batchType}
            currentUsers={currentUsers}
            batchHandleUserChange={this.batchHandleUserChange}
            batchHandlePermChange={this.batchHandlePermChange}
          />
        </Modal>
      </div>
    );
  }
  renderWhiteListEnabled = (text: boolean, record: any) => (
    <Switch
      defaultChecked={text}
      onChange={(checked: boolean) =>
        this.handleToggleWhiteListEnabled(checked, record)
      }
      disabled={!this.state.enableEdit}
    />
  );
  renderRoles = (text: string[]) => {
    return text.join("、");
  };
  renderOperation = (text: boolean, record: any) => {
    return record._whiteListEnabled && this.state.enableEdit ? (
      <Button
        size="small"
        onClick={() => this.openSingleAddUserModel(record)}
        id={`addUserBtn-${record.data.id}`}
        icon={<PlusOutlined />}
      />
    ) : null;
  };
  // 保存最终结果
  store = () => {
    const { collections } = this.state;
    const params: any = {};
    _.forEach(collections.permissionList, (perm) => {
      params[perm.keyAuthorizers] = perm.authorizers;
    });
    this.props.updateFunction(params);
    this.setState({ enableEdit: false });
  };
  batchHandlePermChange = (e: string[]) => {
    this.setState({ temporaryPerms: e });
  };
  batchHandleUserChange = (e: { key: string; label: string }[]) => {
    this.setState({
      temporaryUsers: e.map(
        (user: { key: string; label: string }) => user.label
      ),
    });
  };
  // 打开为单个权限添加用户弹窗
  openSingleAddUserModel = (record: any) => {
    this.batchHandlePermChange([record.data.action]);
    this.setState({
      batchType: "add",
    });
    if (this.props.onSingleAddUserModelOpen) {
      const objectIdObjectMap: Record<
        string,
        Partial<CmdbModels.ModelCmdbObject>
      > = {
        USER: {
          objectId: "USER",
          name: "用户",
        },
        USER_GROUP: {
          objectId: "USER_GROUP",
          name: "用户组",
        },
      };
      const reverseObjectIdMap: Record<string, string> = {
        USER: "USER_GROUP",
        USER_GROUP: "USER",
      };
      const onSingleAddUserModelOpen = (objectId: string) => {
        const object = objectIdObjectMap[objectId];
        const reversedObject = objectIdObjectMap[reverseObjectIdMap[objectId]];
        this.props.onSingleAddUserModelOpen({
          objectId,
          modalTitle: (
            <>
              选择{object.name}
              <Button
                type="link"
                size="small"
                onClick={() =>
                  onSingleAddUserModelOpen(reversedObject.objectId)
                }
                style={{ marginLeft: "8px" }}
              >
                切换为{reversedObject.name}
              </Button>
            </>
          ),
        });
      };
      onSingleAddUserModelOpen("USER_GROUP");
    } else {
      this.setState({ showAddUser: true });
    }
  };
  // 保存为单个权限添加用户
  handleStoreSingleAddUser = () => {
    this.handleUsersChange();
    this.setState({ showAddUser: false });
  };
  // 为单个权限删除一个用户
  removeUser = (e: Event, item: string, record: any) => {
    this.batchHandlePermChange([record.data.action]);
    this.setState({ temporaryUsers: [item], batchType: "remove" });
    this.handleUsersChange();
  };
  // 关闭单个权限添加用户弹窗
  closeSingleAddUserModel = () => {
    this.setState({ showAddUser: false });
  };
  // 打开批量添加／删除用户弹窗
  openBatchSetUserModel(batchType: string) {
    this.setState({
      batchType,
      showBatchHandleUserModal: true,
    });
  }
  // 保存批量添加／删除用户
  handleStoreBatchSetUser = () => {
    this.handleUsersChange();
    this.setState({ showBatchHandleUserModal: false });
  };
  // 关闭批量添加／删除用户弹窗
  closeBatchSetUserModel = () => {
    this.setState({ showBatchHandleUserModal: false });
  };

  handleUsersChange = () => {
    const { temporaryUsers, temporaryPerms, batchType } = this.state;
    _.forEach(this.state.collections.permissionList, (item, index) => {
      if (temporaryPerms.includes(item.data.action)) {
        if (batchType === "add") {
          item.addUsers(temporaryUsers);
        } else {
          item.removeUsers(temporaryUsers);
        }
      }
      this.setState({
        collections: update(this.state.collections, {
          permissionList: {
            [index]: { authorizers: { $set: item.authorizers } },
          },
        }),
      });
    });
    if (_.isFunction(this.state.collections.getCurrentUsers)) {
      this.setState({ currentUsers: this.state.collections.getCurrentUsers() });
    }
  };

  enableEdit = () => {
    this.setState({ enableEdit: true });
  };
  cancelEdit = () => {
    this.setState({ enableEdit: false });
  };

  handleToggleWhiteListEnabled(checked: boolean, record: any) {
    const permissionList = this.state.collections.permissionList;
    const modifiedIndex = permissionList.findIndex(
      (item: any) => item.data.id === record.data.id
    );
    permissionList[modifiedIndex]._whiteListEnabled = checked;
    if (checked && _.isEmpty(permissionList[modifiedIndex].authorizers)) {
      permissionList[modifiedIndex].authorizers.push("easyops");
    }
    this.setState((prevState) => ({
      collections: { ...prevState.collections, permissionList },
    }));
  }
}
