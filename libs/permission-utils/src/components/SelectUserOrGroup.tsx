import React from "react";
import { Select } from "antd";
import { filter, isEmpty } from "lodash";
import {
  SelectUserOrGroupProps,
  SelectUserOrGroupState,
  User,
} from "../interfaces";
import { InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import { handleHttpError } from "@next-core/brick-kit";
import { LabeledValue } from "antd/lib/select";

export class SelectUserOrGroup extends React.Component<
  SelectUserOrGroupProps,
  SelectUserOrGroupState
> {
  constructor(props: SelectUserOrGroupProps) {
    super(props);
    this.state = {
      users: [],
      userGroups: [],
    };
  }
  fetchUser() {
    return InstanceApi_postSearch("USER", {
      query: {},
      fields: {
        instanceId: true,
        name: true,
      },
    });
  }
  fetchUserGroup() {
    return InstanceApi_postSearch("USER_GROUP", {
      query: {},
      fields: {
        instanceId: true,
        name: true,
      },
    });
  }
  async componentDidMount() {
    try {
      const [users, groups] = await Promise.all([
        this.fetchUser(),
        this.fetchUserGroup(),
      ]);
      this.setState({
        users: users.list as User[],
        userGroups: groups.list as User[],
      });
    } catch (e) {
      handleHttpError(e);
    }
  }
  handleUsersChange = (value: LabeledValue[]) => {
    this.props.handleUsersChange(value);
  };
  filterOpts = (currentUsers: string[], allUsers: User[]) => {
    return filter(allUsers, (item) => currentUsers.includes(item.name));
  };
  render(): React.ReactNode {
    const { currentUsers } = this.props;
    const { users: allUsers, userGroups: allUserGroups } = this.state;
    const users = isEmpty(currentUsers)
      ? allUsers
      : this.filterOpts(currentUsers, allUsers);
    const userGroups = isEmpty(currentUsers)
      ? allUserGroups
      : this.filterOpts(currentUsers, allUserGroups);
    return (
      <Select
        labelInValue
        style={{ width: "100%" }}
        mode="multiple"
        placeholder="选择用户（组）"
        onChange={this.handleUsersChange}
        optionFilterProp="label"
      >
        <Select.OptGroup label="用户">
          {users.map((item: any) => (
            <Select.Option
              value={item.instanceId}
              key={item.instanceId}
              label={item.name}
            >
              {item.name}
            </Select.Option>
          ))}
        </Select.OptGroup>
        <Select.OptGroup label="用户组">
          {userGroups.map((item: any) => (
            <Select.Option
              value={item.instanceId}
              key={item.instanceId}
              label={item.name}
            >
              {item.name}
            </Select.Option>
          ))}
        </Select.OptGroup>
      </Select>
    );
  }
}
