import React from "react";
import { Checkbox } from "antd";
import { User, Permission } from "../interfaces";
import { initPermissionOptions } from "../processors";
import { SelectUserOrGroup } from "./SelectUserOrGroup";
import { LabeledValue } from "antd/lib/select";
import i18next from "i18next";
import { NS_LIBS_PERMISSION, K } from "../i18n/constants";

export interface BatchHandleUserProps {
  batchType: string;
  permissionList: Permission[];
  currentUsers: string[];
  batchHandleUserChange(value: LabeledValue[]): void;
  batchHandlePermChange(e: any): void;
}
export interface BatchHandleUserState {
  users: User[];
  userGroups: User[];
}
export class BatchHandleUser extends React.Component<
  BatchHandleUserProps,
  BatchHandleUserState
> {
  constructor(props: BatchHandleUserProps) {
    super(props);
    this.state = {
      users: [],
      userGroups: [],
    };
  }
  render() {
    const permissionOptions = initPermissionOptions(this.props.permissionList);
    const CheckboxGroup = Checkbox.Group;
    const { currentUsers, batchType } = this.props;
    return (
      <div>
        <CheckboxGroup
          options={permissionOptions}
          onChange={this.handleCheckPerm}
        />
        <div>
          <label>
            {i18next.t(
              `${NS_LIBS_PERMISSION}:${K.USER_OR_GROUP_LABEL}`,
              "用户（组）："
            )}
          </label>
          <SelectUserOrGroup
            handleUsersChange={this.handleUsersChange}
            currentUsers={batchType === "remove" ? currentUsers : undefined}
          />
        </div>
      </div>
    );
  }
  handleCheckPerm = (e: any) => {
    this.props.batchHandlePermChange(e);
  };
  handleUsersChange = (e: LabeledValue[]) => {
    this.props.batchHandleUserChange(e);
  };
}
