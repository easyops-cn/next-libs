import { PermissionItem } from "./permissionItem";
import { map, forEach, chain } from "lodash";

export class PermissionCollection {
  permissionList: any;
  constructor(instanceData: any, permissionList: any) {
    this.permissionList = map(
      permissionList,
      perm => new PermissionItem(instanceData, perm)
    );
  }

  save() {
    forEach(this.permissionList, perm => {
      perm.save();
    });
  }

  restore() {
    forEach(this.permissionList, perm => {
      perm.restore();
    });
  }

  getData() {
    const data: any = {};
    forEach(this.permissionList, perm => {
      data[perm.keyAuthorizers] = perm.isWhiteListEnabled()
        ? perm.authorizers
        : [];
    });
    return data;
  }

  getCurrentUsers() {
    return chain(this.permissionList)
      .map(perm => (perm.isWhiteListEnabled() ? perm.authorizers : []))
      .flatten()
      .uniq()
      .value();
  }
}
