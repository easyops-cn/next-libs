import _ from "lodash";
import moment from "moment";
import { JsonStorage } from "@next-libs/storage";

export const GLOBAL_SPACE_NAME = "visitHistory";

export class VisitHistory {
  namespace: any;
  props: any;
  maxRecords: any;
  history: any;
  globalSpace: any;
  jsonLocalStorage: JsonStorage;
  constructor(namespace: any, props: any, options?: any) {
    const jsonLocalStorage = new JsonStorage(localStorage);
    if (!jsonLocalStorage.getItem(GLOBAL_SPACE_NAME)) {
      jsonLocalStorage.setItem(GLOBAL_SPACE_NAME, {});
    }
    // 限定每项最高记录数量
    const MAX_RECORDS = 100;
    options = options || {};
    this.namespace = namespace;
    this.props = props;
    this.maxRecords = options.maxRecords || MAX_RECORDS;
    this.jsonLocalStorage = jsonLocalStorage;
    this.globalSpace = jsonLocalStorage.getItem(GLOBAL_SPACE_NAME);
    this.history = this.globalSpace[namespace];
    if (!this.history) {
      this.history = [];
      jsonLocalStorage.setItem(
        GLOBAL_SPACE_NAME,
        Object.assign(this.globalSpace, {
          [namespace]: [],
        })
      );
    }
  }

  /**
   * @memberof VisitHistory
   * @description 新增一个访问记录
   * @param {any} data 包含了指定属性的对象
   */
  push(data: any) {
    const history = this.history;

    // 删除重复的记录
    const removed = _.remove(
      history,
      _.isNil(this.props) ? data : _.pick(data, this.props)
    );

    // 如果数据是键值对，则补充一些记录数据进去
    if (_.isObject(data) && !_.isArray(data)) {
      // 记录最近访问时间
      (data as any).visitedAt = moment().add(0).format();

      // 计数 +1
      if (removed.length && removed[0]) {
        (data as any).count = ((removed[0] as any).count || 1) + 1;
      }
    }

    // 插入最新一条数据
    history.push(data);

    // 限定最高记录数量
    if (history.length > this.maxRecords) {
      history.shift();
    }

    // 存储在 localStorage
    this.jsonLocalStorage.setItem(
      GLOBAL_SPACE_NAME,
      Object.assign(this.globalSpace, {
        [this.namespace]: history,
      })
    );
  }

  /**
   * @memberof VisitHistory
   * @description 清空记录
   */
  clear() {
    this.history = [];
    this.jsonLocalStorage.setItem(
      GLOBAL_SPACE_NAME,
      Object.assign(this.globalSpace, {
        [this.namespace]: [],
      })
    );
  }

  /**
   * @memberof VisitHistory
   * @description 查询最近访问的某几次记录
   * @param {number} [n=1]
   * @returns {Object[]}
   */
  latest(n: any) {
    return _.takeRight(this.history, n).reverse();
  }

  /**
   * @memberof VisitHistory
   * @description 删除某条记录
   * @param {string | number | string[] | number[]} 需要移除的key的值
   */
  remove(values: string | number | string[] | number[]) {
    _.remove(this.history, (v) => {
      if (_.isArray(values)) {
        return _.includes(values, _.get(v, this.props));
      }
      return _.get(v, this.props) === values;
    });
    this.jsonLocalStorage.setItem(
      GLOBAL_SPACE_NAME,
      Object.assign(this.globalSpace, {
        [this.namespace]: this.history,
      })
    );
  }

  /**
   * @memberof VisitHistory
   * @description 查询最常访问的某几次记录
   * @returns {Object[]}
   */
  frequentlyVisited() {
    return _.chain(this.history)
      .orderBy(
        [
          function (item) {
            return item.count || 1;
          },
          "visitedAt",
        ],
        ["desc", "desc"]
      )
      .value();
  }

  /**
   * @memberof VisitHistory
   * @description 查询所有访问记录
   * @returns {Object[]}
   */
  all() {
    return this.history;
  }

  /**
   * @memberof VisitHistory
   * @description 根据 cmdb 对象 ID 查询对应的命名空间（静态方法）
   * @static
   * @param {string} objectId
   * @returns {string}
   */
  static getNamespaceByCmdbObjectId(objectId: any) {
    switch (objectId) {
      case "APP":
        return "apps";
      case "HOST":
        return "devices";
      default:
        return "cmdb-" + objectId;
    }
  }

  static getNamespaceByQueryStrategyId(objectId: any) {
    return "cmdb-" + objectId + "-query-strategy";
  }
}
