import { getKeyAuthorizersOfPerm } from "../constants";
import { slice, get, isEmpty, pull, forEach, includes, pullAll } from "lodash";

export class PermissionItem {
  instanceData: any;
  data: any;
  keyAuthorizers: any;
  authorizers: any;
  _whiteListEnabled: boolean;
  constructor(instanceData: any, data: any) {
    this.instanceData = instanceData;
    this.data = data;
    this.keyAuthorizers = getKeyAuthorizersOfPerm(data.action);
    this.restore();
  }

  save() {}

  restore() {
    this.authorizers = slice(get(this.instanceData, this.keyAuthorizers));
    this._whiteListEnabled = !isEmpty(this.authorizers);
  }

  isWhiteListEnabled() {
    return this._whiteListEnabled;
  }

  isWhiteListDisabled() {
    return !this._whiteListEnabled;
  }

  enableWhiteList() {
    this._whiteListEnabled = true;
  }

  disableWhiteList() {
    this._whiteListEnabled = false;
  }

  addUsers(users: any) {
    const authorizerSet = new Set(this.authorizers);
    forEach(users, user => {
      if (!authorizerSet.has(user)) {
        authorizerSet.add(user);
      }
    });
    this.authorizers = Array.from(authorizerSet);
    this._whiteListEnabled = !isEmpty(this.authorizers);
  }

  removeUser(user: any) {
    pull(this.authorizers, user);
    this._whiteListEnabled = !isEmpty(this.authorizers);
  }

  removeUsers(users: any) {
    pullAll(this.authorizers, users);
    this._whiteListEnabled = !isEmpty(this.authorizers);
  }
}
