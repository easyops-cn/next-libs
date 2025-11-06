import React from "react";
import { Select } from "antd";
import { debounce, filter, isEmpty } from "lodash";
import {
  SelectUserOrGroupProps,
  SelectUserOrGroupState,
  User,
} from "../interfaces";
import { InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import { handleHttpError } from "@next-core/brick-kit";
import { LabeledValue } from "antd/lib/select";
import i18next from "i18next";
import { NS_LIBS_PERMISSION, K } from "../i18n/constants";

export class SelectUserOrGroup extends React.Component<
  SelectUserOrGroupProps,
  SelectUserOrGroupState
> {
  constructor(props: SelectUserOrGroupProps) {
    super(props);
    this.state = {
      users: [],
      userGroups: [],
      loading: false,
    };
  }
  fetchUser(q?: string) {
    return InstanceApi_postSearch("USER", {
      query: q ? { name: { $like: `%${q}%` } } : undefined,
      fields: {
        instanceId: true,
        name: true,
      },
    });
  }
  fetchUserGroup(q?: string) {
    return InstanceApi_postSearch("USER_GROUP", {
      query: q ? { name: { $like: `%${q}%` } } : undefined,
      fields: {
        instanceId: true,
        name: true,
      },
    });
  }
  async updateUserAndUserGroup(q?: string) {
    this.setState({ loading: true });
    try {
      const [users, groups] = await Promise.all([
        this.fetchUser(q),
        this.fetchUserGroup(q),
      ]);
      this.setState({
        users: users.list as User[],
        userGroups: groups.list as User[],
      });
    } catch (e) {
      handleHttpError(e);
    } finally {
      this.setState({ loading: false });
    }
  }
  debounceUpdateUserAndUserGroup = debounce(this.updateUserAndUserGroup, 500);
  componentDidMount() {
    this.updateUserAndUserGroup();
  }
  handleUsersChange = (value: LabeledValue[]) => {
    this.props.handleUsersChange(value);
  };
  filterOpts = (currentUsers: string[], allUsers: User[]) => {
    const currentUsersSet = new Set(currentUsers);
    return filter(
      allUsers,
      (item) =>
        currentUsersSet.has(item.name) ||
        currentUsersSet.has(`:${item.instanceId}`)
    );
  };
  render(): React.ReactNode {
    const { currentUsers } = this.props;
    const { users: allUsers, userGroups: allUserGroups, loading } = this.state;
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
        placeholder={i18next.t(
          `${NS_LIBS_PERMISSION}:${K.SELECT_USER_OR_GROUP}`,
          "选择用户（组）"
        )}
        onChange={this.handleUsersChange}
        filterOption={false}
        showSearch
        onSearch={(value) => this.debounceUpdateUserAndUserGroup(value)}
        loading={loading}
      >
        <Select.OptGroup
          label={i18next.t(`${NS_LIBS_PERMISSION}:${K.USER}`, "用户")}
        >
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
        <Select.OptGroup
          label={i18next.t(`${NS_LIBS_PERMISSION}:${K.USER_GROUP}`, "用户组")}
        >
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
