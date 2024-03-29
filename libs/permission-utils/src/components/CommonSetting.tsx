import React from "react";
import update from "immutability-helper";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Table, Button, Modal, Switch, Tag } from "antd";
import * as _ from "lodash";
import { Permission } from "../interfaces";
import { BatchHandleUser } from "./BatchHandleUser";
import { PermissionCollection } from "../processors";
import { SelectUserOrGroup } from "./SelectUserOrGroup";
import styles from "./index.module.css";
import { handleHttpError, getAuth } from "@next-core/brick-kit";
import {
  UserAdminApi_listGroupsIdName,
  UserAdminApi_ListGroupsIdNameResponseBody,
} from "@next-sdk/user-service-sdk";
import { LabeledValue } from "antd/lib/select";

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
  fillCurrentLoginUser?: boolean;
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
  idMapName?: UserAdminApi_ListGroupsIdNameResponseBody;
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
      idMapName: {},
    };
  }
  async componentDidMount() {
    let idMapName = {};
    try {
      idMapName = await UserAdminApi_listGroupsIdName({});
    } catch (e) {
      handleHttpError(e);
    }
    const { instanceData, permissionList } = this.props;
    const collections = new PermissionCollection(instanceData, permissionList);
    this.setState({ collections });
    this.setState({ currentUsers: collections.getCurrentUsers() });
    this.setState({ idMapName });
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
                  onClose={(e: any) => this.removeUser(e, item, record)}
                >
                  {(item.startsWith(":") && this.state.idMapName[item]) || item}
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
      defaultChecked={!!record.authorizers.length}
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
  batchHandleUserChange = (e: LabeledValue[]) => {
    const idKeysSet = new Set(Object.keys(this.state.idMapName));
    this.setState({
      temporaryUsers: e.map((user) => {
        const key = `:${user.key}`;
        return idKeysSet.has(key) ? key : user.label;
      }) as string[],
    });
  };
  // 打开为单个权限添加用户弹窗
  openSingleAddUserModel = (record: any) => {
    this.batchHandlePermChange([record.data.action]);
    this.setState({
      batchType: "add",
      showAddUser: true,
    });
  };
  // 保存为单个权限添加用户
  handleStoreSingleAddUser = () => {
    this.handleUsersChange();
    this.setState({ showAddUser: false });
  };
  // 为单个权限删除一个用户
  removeUser = (e: React.MouseEvent, item: string, record: any) => {
    this.batchHandlePermChange([record.data.action]);
    this.setState({ temporaryUsers: [item], batchType: "remove" }, () => {
      this.handleUsersChange();
    });
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
      let user = "easyops";
      if (this.props.fillCurrentLoginUser) {
        const { username } = getAuth();
        user = username;
      }
      permissionList[modifiedIndex].authorizers.push(user);
    } else if (!checked) {
      permissionList[modifiedIndex].authorizers = [];
    }
    this.setState((prevState) => ({
      collections: { ...prevState.collections, permissionList },
    }));
  }
}
