export interface Permission {
  action: string;
  id: string;
  remark: string;
  resource: {};
  roles: string[];
  system: string;
  user: string[];
}

export interface User {
  name: string;
  instanceId: string;
}
export interface SelectUserOrGroupProps {
  handleUsersChange: Function;
  filterFunction?: Function;
  currentUsers?: string[];
}
export interface SelectUserOrGroupState {
  users: User[];
  userGroups: User[];
}
