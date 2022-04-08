import { LabeledValue } from "antd/lib/select";

export interface Permission {
  action: string;
  id: string;
  remark: string;
  resource: Record<string, unknown>;
  roles: string[];
  system: string;
  user: string[];
}

export interface User {
  name: string;
  instanceId: string;
}
export interface SelectUserOrGroupProps {
  handleUsersChange(value: LabeledValue[]): void;
  filterFunction?(): void;
  currentUsers?: string[];
}
export interface SelectUserOrGroupState {
  users: User[];
  userGroups: User[];
  loading: boolean;
}
