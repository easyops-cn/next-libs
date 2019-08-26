import React from "react";
import { Checkbox } from "antd";
import { User, Permission } from "../interfaces";
import { initPermissionOptions } from "../processors";
import { SelectUserOrGroup } from "./SelectUserOrGroup";

export interface BatchHandleUserProps {
  batchType: string;
  permissionList: Permission[];
  currentUsers: string[];
  batchHandleUserChange: Function;
  batchHandlePermChange: Function;
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
      userGroups: []
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
          <label>用户（组）：</label>
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
  handleUsersChange = (e: string[]) => {
    this.props.batchHandleUserChange(e);
  };
}
