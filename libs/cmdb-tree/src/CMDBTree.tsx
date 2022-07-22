// todo(ice): rewrite unit test
/* istanbul ignore file */
import React from "react";
import { Tree, Spin, Empty, Tooltip } from "antd";
import { EventDataNode, DataNode } from "antd/lib/tree";
import { sortBy, isEmpty, keyBy, get } from "lodash";

import { handleHttpError, getAuth } from "@next-core/brick-kit";
import {
  CmdbObjectApi_getObjectAll,
  InstanceTreeApi_instanceTreeExpand,
  InstanceTreeApi_instanceTreeAnchor,
  InstanceTreeApi_instanceTreeSearch,
  CmdbModels,
  InstanceTreeApi_instanceTree,
  InstanceApi_postSearch,
} from "@next-sdk/cmdb-sdk";

import {
  search,
  getObjectId2ShowKeys,
  getObjectIds,
  getTitle,
  fixRequestFields,
  getRelation2ObjectId,
  updateChildren,
  checkPermission,
  removeNoPermissionNode,
} from "./processors";
import style from "./style.module.css";

export interface SelectInfo {
  event: "select";
  selected: boolean;
  node: EventDataNode;
  selectedNodes: DataNode[];
  nativeEvent: MouseEvent;
}

export interface CheckInfo {
  event: "check";
  node: EventDataNode;
  checked: boolean;
  nativeEvent: MouseEvent;
  checkedNodes: DataNode[];
  checkedNodesPositions?: {
    node: DataNode;
    pos: string;
  }[];
  halfCheckedKeys?: React.Key[];
}

export interface ExpandInfo {
  node: EventDataNode;
  expanded: boolean;
  nativeEvent: MouseEvent;
}

export interface TreeNode {
  key: string;
  title: string;
  type?: string;
  isLeaf?: boolean;
  children?: TreeNode[];
  authorized?: boolean;
}

interface CustomTreeNode extends TreeNode {
  objectId: string;
}

interface CMDBTreeProps {
  /* base props */
  q: string;
  handleOnDragStart?: (e: any) => void;
  handleOnDragEnd?: (e: any) => void;
  showIcon?: boolean;
  iconRenderer?: (type: string, y: number) => React.ReactNode;
  /* front end search props */
  treeData?: TreeNode[];
  /* back end search props */
  treeRequestBody?: { tree: CmdbModels.ModelInstanceTreeRootNode };
  onSelect?: (keys: React.Key[], info: SelectInfo) => void;
  checkable?: boolean;
  checkStrictly?: boolean;
  defaultCheckedKeys?: string[];
  checkIds?: string[];
  onCheck?: (
    keys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] },
    info: CheckInfo
  ) => void;
  treeHead?: {
    key: string;
    objectId: string;
    title: string;
  };
  selectedObjectId?: string;
  selectedInstanceId?: string;
  style?: React.CSSProperties;
  hideObjectNameTooltip?: boolean;
  expand?: boolean;
  enabledShowAll?: boolean;
  notSort?: boolean;
  notFixed?: boolean;
  checkWhiteList?: boolean;
  userGroupIds?: string[];
}

interface CMDBTreeState {
  key: string;
  treeData: TreeNode[];
  expandAll: boolean;
  expandKeys: React.Key[];
  autoExpandParent: boolean;
  loading: boolean;
  prevQ: string;
  prevExpand: boolean;
  isSearched: boolean; //判断是否发生搜索，展开收起的动作。
}
let userGroupIdsCache: string[];
export class CMDBTree extends React.Component<CMDBTreeProps, CMDBTreeState> {
  treeData: any[];
  initializing = false;
  needScrollIntoView = true;
  backendSearch = true;
  relation2ObjectId: Map<string, string> = null;
  fields: string[] = [];
  objectId2ShowKeys: Map<string, string[]> = null;
  objectIds: string[] = ["BUSINESS", "APP"];
  objectMap: Record<string, CmdbModels.ModelCmdbObject> = null;
  relations: string[] = [];
  cacheOnLoad: Map<string, CustomTreeNode[]> = new Map();
  username: string;
  userGroupIds: string[] = [];
  constructor(props: CMDBTreeProps) {
    super(props);
    this.state = {
      key: "",
      treeData: this.props.treeData,
      expandAll: false,
      expandKeys: [],
      autoExpandParent: true,
      loading: isEmpty(this.props.treeData),
      prevQ: "",
      prevExpand: false,
      isSearched: false,
    };
    this.userGroupIds = this.props.userGroupIds || [];
    this.backendSearch = isEmpty(this.props.treeData);
    this.onExpand = this.onExpand.bind(this);
    this.onLoadData = this.onLoadData.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  async componentDidMount() {
    const { username, userInstanceId } = getAuth();
    this.username = username;
    if (!this.props.userGroupIds && this.props.checkWhiteList) {
      if (!userGroupIdsCache) {
        try {
          const userGroupData = await InstanceApi_postSearch("USER", {
            fields: { name: true, "__members_USER_GROUP.name": true },
            query: { instanceId: userInstanceId },
          });
          const currentUserGroup =
            userGroupData.list[0]?.["__members_USER_GROUP"];
          this.userGroupIds = (currentUserGroup || []).map(
            (i: any) => ":" + i.instanceId
          );
          userGroupIdsCache = this.userGroupIds;
        } catch (e) {
          handleHttpError(e);
        }
      } else {
        this.userGroupIds = userGroupIdsCache;
      }
    }
    this.initializing = true;
    await this.initTree();
    this.initializing = false;

    if (this.props.selectedInstanceId && this.needScrollIntoView) {
      this.scrollIntoView();
      this.needScrollIntoView = false;
    }
  }

  static getDerivedStateFromProps(props: CMDBTreeProps, state: CMDBTreeState) {
    if (props.q !== state.prevQ && !props.enabledShowAll) {
      return {
        treeData: [] as any[],
        loading: true,
        prevQ: props.q,
      };
    }

    if (
      props.enabledShowAll &&
      (props.expand !== state.prevExpand || props.q !== state.prevQ)
    ) {
      let treeData = state.treeData;
      let loading = state.loading;
      if (props.expand) {
        treeData = [];
        loading = true;
      } else {
        if (state.prevQ && !props.q) {
          treeData = [];
          loading = true;
        }
      }
      return {
        treeData,
        loading,
        prevExpand: props.expand,
        prevQ: props.q,
        isSearched: true,
      };
    }
    return null;
  }
  async showAll(q: string) {
    if (this.props.q) {
      if (this.props.expand) {
        this.setState({ isSearched: false });
        this.searchTree(this.props.q);
      } else {
        this.setState({ expandKeys: [], isSearched: false });
      }
    } else {
      if (this.props.expand) {
        let resp = {};
        try {
          const data = {
            ...this.props.treeRequestBody,
          };
          resp = await InstanceTreeApi_instanceTree(data);
        } catch (err) {
          handleHttpError(err);
        }
        this.setState({ isSearched: false });
        this.updateTreeNodes(resp);
      } else {
        const expandKeys: string[] = [];
        this.setState({ expandKeys, isSearched: false });
        if (q) {
          this.initTree();
        }
      }
    }
  }
  componentDidUpdate(prevProps: CMDBTreeProps, prevState: CMDBTreeState) {
    if (
      !this.props.enabledShowAll &&
      isEmpty(this.state.treeData) &&
      this.state.loading
    ) {
      if (this.props.q) {
        this.searchTree(this.props.q);
      } else {
        if (!this.initializing) {
          this.initTree();
        }
      }
    }
    if (this.props.enabledShowAll) {
      if (this.state.isSearched) {
        this.showAll(prevProps.q);
      }
    }
  }

  scrollIntoView() {
    const selected = document.getElementsByClassName("ant-tree-node-selected");
    if (selected.length > 0) {
      /* eslint-disable */
      // @ts-ignore: fix page scroll bug
      if (typeof selected[0].scrollIntoViewIfNeeded === "function") {
        // @ts-ignore: fix page scroll bug
        selected[0].scrollIntoViewIfNeeded();
        /* eslint-disable */
      } else {
        selected[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  }

  async initTree() {
    if (!this.backendSearch) {
      this.setState({ treeData: this.props.treeData, loading: false });
      return;
    }

    const treeRequest = this.props.treeRequestBody.tree;
    const objectId = treeRequest.object_id;
    const resp = await CmdbObjectApi_getObjectAll({});
    const objectList = resp.data as CmdbModels.ModelCmdbObject[];
    this.objectMap = keyBy(objectList, "objectId");
    this.objectId2ShowKeys = getObjectId2ShowKeys(objectList);
    this.objectIds = getObjectIds(objectList, treeRequest);
    // inside `fixRequestFields`, treeRequestBody will be updated
    this.fields = fixRequestFields(
      objectList,
      treeRequest,
      this.props.notFixed,
      this.props.checkWhiteList
    );
    const promises: any[] = [];
    promises.push(this.expandTree());
    if (this.props.selectedObjectId && this.props.selectedInstanceId) {
      promises.push(
        this.anchorTree(
          this.props.selectedObjectId,
          this.props.selectedInstanceId
        )
      );
    }
    const [data, anchorTree] = await Promise.all(promises);
    this.relation2ObjectId = getRelation2ObjectId(objectList, treeRequest);
    this.relations = Array.from(this.relation2ObjectId.keys());

    const nodes = this.formatTreeNodes(data, this.objectIds);
    const expandKeys: string[] = [];

    if (anchorTree && anchorTree[objectId]) {
      this.convertTrees(anchorTree[objectId], this.relations);
      const outermost = (anchorTree[this.props.selectedObjectId] ??
        anchorTree[objectId])[0];
      const node = nodes.find((node) => node.key === outermost.instanceId);
      node.children = outermost.children;
      this.findExpandKeys(node, expandKeys);
    }

    this.treeData = nodes;
    const treeData = this.withHead(nodes);
    this.props.checkWhiteList && removeNoPermissionNode(treeData);
    this.setState({
      treeData,
      loading: false,
      expandKeys,
      expandAll: false,
      key: "init",
    });
  }

  findExpandKeys(node: any, keys: string[]): boolean {
    if (node.key === this.props.selectedInstanceId) {
      return true;
    }
    if (isEmpty(node.children)) {
      return false;
    }

    let found = false;
    for (const child of node.children) {
      found = this.findExpandKeys(child, keys);
      if (found) {
        keys.push(node.key);
        break;
      }
    }

    return found;
  }

  findAllKeys(nodes: any[], keys: string[]) {
    for (const node of nodes) {
      if (!isEmpty(node.children)) {
        keys.push(node.key);
        this.findAllKeys(node.children, keys);
      }
    }
  }

  withHead(nodes: any[], withChilren = false) {
    let treeData = nodes;
    if (this.props.treeHead) {
      treeData = [
        {
          ...this.props.treeHead,
          isHead: true,
          disabled: true,
          ...(withChilren ? { children: nodes } : {}),
        },
      ];
    }
    return treeData;
  }

  formatTreeNodes(data: any, ids: string[]): CustomTreeNode[] {
    for (const id of ids) {
      if (isEmpty(data[id])) {
        data[id] = [];
      }
      if (!this.props.notSort) {
        data[id] = sortBy(data[id], this.fields);
      }
    }
    //这里改变了顺序
    const totalKeys = [];
    for (const [relation, objectId] of this.relation2ObjectId) {
      totalKeys.push(`___total_for_${objectId}$${relation}`);
    }
    const nodes: CustomTreeNode[] = [];
    for (const id of ids) {
      for (const instance of data[id]) {
        const isLeaf = !totalKeys.some((key) => instance[key]);

        const objectId = instance._object_id;
        const key = instance.instanceId;
        const showKeys = this.objectId2ShowKeys.get(objectId);
        const title = getTitle(instance, showKeys);
        const authorized = this.props.checkWhiteList
          ? checkPermission(
              instance.readAuthorizers,
              this.username,
              this.userGroupIds
            )
          : true;
        const node: CustomTreeNode = {
          key,
          title,
          objectId,
          isLeaf,
          authorized,
        };
        if (this.cacheOnLoad.has(key)) {
          node.children = this.cacheOnLoad.get(key);
        }
        nodes.push(node);
      }
    }

    return nodes;
  }

  async expandTree(
    objectId: string = undefined,
    instanceId: string = undefined
  ) {
    const data = {
      instanceId,
      objectId,
      ...this.props.treeRequestBody,
    };
    try {
      const resp = await InstanceTreeApi_instanceTreeExpand(data);
      return resp;
    } catch (err) {
      handleHttpError(err);
    }
  }

  async anchorTree(objectId: string, instanceId: string) {
    const data = {
      object_id: objectId,
      instanceId,
      ignore_single: false,
      ...this.props.treeRequestBody,
    };

    try {
      const resp = await InstanceTreeApi_instanceTreeAnchor(data);
      return resp;
    } catch (err) {
      handleHttpError(err);
    }
  }

  async searchTree(q: string) {
    if (!q) {
      return;
    }
    if (!this.backendSearch) {
      const treeData = search(this.props.treeData, q);
      this.setExpandAll(treeData);
      return;
    }

    const or = [];
    for (const field of this.fields) {
      or.push({ [field]: { $like: `%${q}%` } });
    }

    try {
      const data = {
        query: {
          $or: or,
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ignore_single: false,
        ...this.props.treeRequestBody,
      };
      const resp = await InstanceTreeApi_instanceTreeSearch(data);
      this.updateTreeNodes(resp);
    } catch (err) {
      handleHttpError(err);
    }
  }

  setExpandAll(treeData: TreeNode[]) {
    const expandKeys: string[] = [];
    // `defaultExpandAll` may not work well, instead, find all keys to expand it
    this.findAllKeys(treeData, expandKeys);
    this.props.checkWhiteList && removeNoPermissionNode(treeData);
    this.setState({
      // use different key to force re-render Tree, to make `expandAll` work
      key: "search" + this.props.q,
      treeData,
      loading: false,
      expandKeys,
    });
  }

  updateTreeNodes(resp: Record<string, any>) {
    this.treeData = [];
    for (const objectId of this.objectIds) {
      if (isEmpty(resp[objectId])) resp[objectId] = [];
      this.convertTrees(resp[objectId], this.relations);
      this.treeData.push(...resp[objectId]);
    }
    const treeData = this.withHead(this.treeData, true);
    this.setExpandAll(treeData);
  }

  convertTrees(instances: any[], keys: string[]) {
    if (isEmpty(instances)) return;

    for (const instance of instances) {
      let isLeaf = true;
      instance.key = instance.instanceId;
      instance.objectId = instance._object_id;
      const showKeys = this.objectId2ShowKeys.get(instance.objectId);
      instance.title = getTitle(instance, showKeys);
      instance.authorized = this.props.checkWhiteList
        ? checkPermission(
            instance.readAuthorizers,
            this.username,
            this.userGroupIds
          )
        : true;
      for (const key of keys) {
        if (!isEmpty(instance[key])) {
          isLeaf = false;
          if (instance.children === undefined) {
            instance.children = [];
          }
          if (!this.props.notSort) {
            instance[key] = sortBy(instance[key], this.fields);
          }
          instance.children = [...instance.children, ...instance[key]];
          this.convertTrees(instance[key], keys);
        }
      }
      instance.isLeaf = isLeaf;
    }
  }

  async onLoadData(treeNode: EventDataNode) {
    if (!isEmpty(this.props.treeData)) {
      return;
    }

    if ((treeNode as any).props["data-ref"].isHead) {
      (treeNode as any).props["data-ref"].children = this.treeData;
      this.setState({ treeData: [...this.state.treeData] });
      return;
    }

    if (this.props.q) return;

    const objectId = (treeNode as any).props["data-ref"].objectId;
    const instanceId = (treeNode as any).props["data-ref"].key;
    const data = await this.expandTree(objectId, instanceId);
    const nodes = this.formatTreeNodes(data[objectId][0], this.relations);
    this.cacheOnLoad.set(instanceId, nodes);
    // eslint-disable-next-line require-atomic-updates
    updateChildren(instanceId, this.state.treeData, nodes);
    this.setState({
      treeData: [...this.state.treeData],
      expandKeys: [instanceId, ...this.state.expandKeys],
    });
  }

  renderTitle(node: CustomTreeNode): React.ReactNode {
    const title = node.title;
    let objectName: string;
    if (this.objectMap) {
      const objectId = node.objectId;
      objectName = this.objectMap[objectId].name;
    }
    let titleNode = <span className="ant-tree-title">{title}</span>;
    if (this.props.q) {
      const qLen = this.props.q.length;
      const color = "rgb(204, 121, 33)";
      const segments = title.toLowerCase().split(this.props.q.toLowerCase());
      const nodes: React.ReactNode[] = [];
      let count = 0;
      segments.forEach((seg: string, index: number) => {
        nodes.push(
          <React.Fragment key={seg + index}>
            {title.substr(count, seg.length)}
          </React.Fragment>
        );
        count += seg.length;
        nodes.push(
          <span key={this.props.q + index} style={{ color }}>
            {title.substr(count, qLen)}
          </span>
        );
        count += qLen;
      });
      titleNode = <span className="ant-tree-title">{nodes.slice(0, -1)}</span>;
    }
    return this.props.hideObjectNameTooltip ? (
      <span>{titleNode}</span>
    ) : (
      <Tooltip title={objectName} placement="right">
        {titleNode}
      </Tooltip>
    );
  }

  renderTreeNodes(nodes: any[]) {
    const hasData = !isEmpty(this.props.treeData);
    return nodes.map((node) => {
      const y = node.isHead ? -1 : -2;
      const prop = this.props.showIcon
        ? { icon: this.props.iconRenderer(node.objectId, y) }
        : {};
      if (node.children) {
        return (
          <Tree.TreeNode
            {...prop}
            key={node.key}
            title={this.renderTitle(node)}
            isLeaf={hasData ? isEmpty(node.children) : node.isLeaf}
            disabled={node.disabled}
            data-ref={node}
          >
            {this.renderTreeNodes(node.children)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          {...prop}
          key={node.key}
          title={this.renderTitle(node)}
          isLeaf={hasData ? isEmpty(node.children) : node.isLeaf}
          disabled={node.disabled}
          data-ref={node}
        />
      );
    });
  }

  onExpand(expandKeys: React.Key[], info: ExpandInfo) {
    if (!info.expanded) {
      const key = (info.node as any).props.eventKey;
      expandKeys = expandKeys.filter((k) => k !== key);
    }
    this.setState({
      expandKeys,
      autoExpandParent: false,
    });
  }

  render(): React.ReactNode {
    const child = this.state.loading ? (
      <Spin
        delay={200}
        style={{
          paddingBottom: "100%",
          display: "flex",
          justifyContent: "left",
          transform: "translate(45%,75%)",
        }}
      />
    ) : isEmpty(this.state.treeData) ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    ) : (
      <Tree
        key={this.state.key}
        selectedKeys={[this.props.selectedInstanceId]}
        draggable
        showIcon={this.props.showIcon}
        showLine={{ showLeafIcon: false }}
        onSelect={this.props.onSelect}
        checkable={this.props.checkable}
        checkStrictly={this.props.checkStrictly}
        defaultCheckedKeys={this.props.defaultCheckedKeys}
        checkedKeys={this.props.checkIds}
        onCheck={this.props.onCheck}
        onDragStart={this.props.handleOnDragStart}
        onDragEnd={this.props.handleOnDragEnd}
        loadData={this.onLoadData}
        expandedKeys={this.state.expandKeys}
        onExpand={this.onExpand}
        autoExpandParent={this.state.autoExpandParent}
        defaultExpandAll={this.state.expandAll}
      >
        {this.renderTreeNodes(this.state.treeData)}
      </Tree>
    );

    return (
      <div className={style.easyopsCustomizeAntTree} style={this.props.style}>
        {child}
      </div>
    );
  }
}
