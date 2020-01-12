// todo(ice): rewrite unit test
/* istanbul ignore file */
import React from "react";
import { Tree, Spin, Empty, Tooltip } from "antd";
import {
  AntTreeNode,
  AntTreeNodeExpandedEvent,
  AntTreeNodeSelectedEvent,
  AntTreeNodeCheckedEvent
} from "antd/lib/tree";
import { sortBy, isEmpty, keyBy, get } from "lodash";

import { handleHttpError } from "@easyops/brick-kit";
import { CmdbObjectApi, InstanceTreeApi, CmdbModels } from "@sdk/cmdb-sdk";

import {
  search,
  getObjectId2ShowKeys,
  getObjectIds,
  getTitle,
  fixRequestFields,
  getRelation2ObjectId,
  updateChildren
} from "./processors";
import style from "./style.module.css";

export interface TreeNode {
  key: string;
  title: string;
  type?: string;
  isLeaf?: boolean;
  children?: TreeNode[];
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
  onSelect?: (keys: string[], e: AntTreeNodeSelectedEvent) => void;
  checkable?: boolean;
  checkStrictly?: boolean;
  defaultCheckedKeys?: string[];
  checkIds?: string[];
  onCheck?: (
    keys: string[] | { checked: string[]; halfChecked: string[] },
    e: AntTreeNodeCheckedEvent
  ) => void;
  treeHead?: {
    key: string;
    objectId: string;
    title: string;
  };
  selectedObjectId?: string;
  selectedInstanceId?: string;
}

interface CMDBTreeState {
  key: string;
  treeData: TreeNode[];
  expandAll: boolean;
  expandKeys: string[];
  autoExpandParent: boolean;
  loading: boolean;
  prevQ: string;
}

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

  constructor(props: CMDBTreeProps) {
    super(props);
    this.state = {
      key: "",
      treeData: this.props.treeData,
      expandAll: false,
      expandKeys: [],
      autoExpandParent: true,
      loading: isEmpty(this.props.treeData),
      prevQ: ""
    };

    this.backendSearch = isEmpty(this.props.treeData);
    this.onExpand = this.onExpand.bind(this);
    this.onLoadData = this.onLoadData.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  async componentDidMount() {
    this.initializing = true;
    await this.initTree();
    this.initializing = false;

    if (this.props.selectedInstanceId && this.needScrollIntoView) {
      this.scrollIntoView();
      this.needScrollIntoView = false;
    }
  }

  static getDerivedStateFromProps(props: CMDBTreeProps, state: CMDBTreeState) {
    if (props.q !== state.prevQ) {
      return {
        treeData: [] as any[],
        loading: true,
        prevQ: props.q
      };
    }

    return null;
  }

  componentDidUpdate() {
    if (isEmpty(this.state.treeData) && this.state.loading) {
      if (this.props.q) {
        this.searchTree(this.props.q);
      } else {
        if (!this.initializing) {
          this.initTree();
        }
      }
    }
  }

  scrollIntoView() {
    const selected = document.getElementsByClassName("ant-tree-node-selected");
    if (selected.length > 0) {
      selected[0].scrollIntoView({ block: "center", inline: "center" });
    }
  }

  async initTree() {
    if (!this.backendSearch) {
      this.setState({ treeData: this.props.treeData, loading: false });
      return;
    }

    const treeRequest = this.props.treeRequestBody.tree;
    const objectId = treeRequest.object_id;
    const resp = await CmdbObjectApi.getObjectAll({});
    const objectList = resp.data as CmdbModels.ModelCmdbObject[];
    this.objectMap = keyBy(objectList, "objectId");
    this.objectId2ShowKeys = getObjectId2ShowKeys(objectList);
    this.objectIds = getObjectIds(objectList, treeRequest);
    // inside `fixRequestFields`, treeRequestBody will be updated
    this.fields = fixRequestFields(objectList, treeRequest);

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
      const outermost = anchorTree[this.props.selectedObjectId][0];
      const node = nodes.find(node => node.key === outermost.instanceId);
      node.children = outermost.children;
      this.findExpandKeys(node, expandKeys);
    }

    this.treeData = nodes;
    const treeData = this.withHead(nodes);
    this.setState({
      treeData,
      loading: false,
      expandKeys,
      expandAll: false,
      key: "init"
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
          ...(withChilren ? { children: nodes } : {})
        }
      ];
    }
    return treeData;
  }

  formatTreeNodes(data: any, ids: string[]): CustomTreeNode[] {
    for (const id of ids) {
      if (isEmpty(data[id])) {
        data[id] = [];
      }
      data[id] = sortBy(data[id], this.fields);
    }

    const totalKeys = [];
    for (const [relation, objectId] of this.relation2ObjectId) {
      totalKeys.push(`___total_for_${objectId}$${relation}`);
    }
    const nodes: CustomTreeNode[] = [];
    for (const id of ids) {
      for (const instance of data[id]) {
        const isLeaf = !totalKeys.some(key => instance[key]);

        const objectId = instance._object_id;
        const key = instance.instanceId;
        const showKeys = this.objectId2ShowKeys.get(objectId);
        const title = getTitle(instance, showKeys);
        const node: CustomTreeNode = {
          key,
          title,
          objectId,
          isLeaf
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
      ...this.props.treeRequestBody
    };
    try {
      const resp = await InstanceTreeApi.instanceTreeExpand(data);
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
      ...this.props.treeRequestBody
    };

    try {
      const resp = await InstanceTreeApi.instanceTreeAnchor(data);
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
          $or: or
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        ignore_single: false,
        ...this.props.treeRequestBody
      };
      const resp = await InstanceTreeApi.instanceTreeSearch(data);
      this.updateTreeNodes(resp);
    } catch (err) {
      handleHttpError(err);
    }
  }

  setExpandAll(treeData: TreeNode[]) {
    const expandKeys: string[] = [];
    // `defaultExpandAll` may not work well, instead, find all keys to expand it
    this.findAllKeys(treeData, expandKeys);
    this.setState({
      // use different key to force re-render Tree, to make `expandAll` work
      key: "search" + this.props.q,
      treeData,
      loading: false,
      expandKeys
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
      for (const key of keys) {
        if (!isEmpty(instance[key])) {
          isLeaf = false;
          if (instance.children === undefined) {
            instance.children = [];
          }
          instance[key] = sortBy(instance[key], this.fields);
          instance.children = [...instance.children, ...instance[key]];
          this.convertTrees(instance[key], keys);
        }
      }
      instance.isLeaf = isLeaf;
    }
  }

  async onLoadData(treeNode: AntTreeNode) {
    if (!isEmpty(this.props.treeData)) {
      return;
    }

    if (treeNode.props.dataRef.isHead) {
      treeNode.props.dataRef.children = this.treeData;
      this.setState({ treeData: [...this.state.treeData] });
      return;
    }

    if (this.props.q) return;

    const objectId = treeNode.props.dataRef.objectId;
    const instanceId = treeNode.props.dataRef.key;
    const data = await this.expandTree(objectId, instanceId);
    const nodes = this.formatTreeNodes(data[objectId][0], this.relations);
    this.cacheOnLoad.set(instanceId, nodes);
    // eslint-disable-next-line require-atomic-updates
    updateChildren(instanceId, this.state.treeData, nodes);
    this.setState({
      treeData: [...this.state.treeData],
      expandKeys: [instanceId, ...this.state.expandKeys]
    });
  }

  renderTitle(node: CustomTreeNode): React.ReactNode {
    const title = node.title;
    const objectId = node.objectId;
    const objectName = this.objectMap[objectId].name;
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
    return (
      <Tooltip title={objectName} placement="right">
        {titleNode}
      </Tooltip>
    );
  }

  renderTreeNodes(nodes: any[]) {
    const hasData = !isEmpty(this.props.treeData);
    return nodes.map(node => {
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
            dataRef={node}
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
          dataRef={node}
        />
      );
    });
  }

  onExpand(expandKeys: string[], info: AntTreeNodeExpandedEvent) {
    if (!info.expanded) {
      const key = info.node.props.eventKey;
      expandKeys = expandKeys.filter(k => k !== key);
    }
    this.setState({
      expandKeys,
      autoExpandParent: false
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
          transform: "translate(45%,75%)"
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
        showLine
        className="hide-file-icon"
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

    return <div className={style.easyopsCustomizeAntTree}>{child}</div>;
  }
}
