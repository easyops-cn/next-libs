import React from "react";
import { Tree, Spin, Empty } from "antd";
import { AntTreeNode } from "antd/lib/tree";
import { sortBy, isEmpty } from "lodash";

import { handleHttpError } from "@easyops/brick-kit";
import { InstanceTreeApi } from "@sdk/cmdb-sdk";

import { search } from "./processors";
import style from "./style.module.css";

export interface TreeNode {
  key: string;
  title: string;
  type?: string;
  children?: TreeNode[];
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
  treeRequestBody?: any;
  onSelect?: (keys: string[], e: any) => void;
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
  treeData: any[];
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

    const nodes = this.formatTreeNodes(data, ["BUSINESS", "APP"]);
    const expandKeys: string[] = [];

    if (anchorTree && anchorTree.BUSINESS) {
      this.convertTrees(anchorTree.BUSINESS);
      const outermost = anchorTree.BUSINESS[0];
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

  formatTreeNodes(data: any, relations: string[]) {
    for (const relation of relations) {
      if (isEmpty(data[relation])) {
        data[relation] = [];
      }
      data[relation] = sortBy(data[relation], item => item.name.toLowerCase());
    }

    const nodes: any[] = [];
    for (const relation of relations) {
      for (const instance of data[relation]) {
        let isLeaf = true;
        if (
          instance.___total_for_BUSINESS$_businesses_APP ||
          instance.___total_for_BUSINESS$_sub_system
        ) {
          isLeaf = false;
        }

        const node = {
          key: instance.instanceId,
          title: instance.name,
          objectId: instance._object_id,
          isLeaf
        };
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

    try {
      const data = {
        query: { name: { $like: `%${q}%` } },
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
    if (isEmpty(resp.BUSINESS)) resp.BUSINESS = [];
    if (isEmpty(resp.APP)) resp.APP = [];
    this.convertTrees(resp.BUSINESS);
    this.convertTrees(resp.APP);
    this.treeData = [...resp.BUSINESS, ...resp.APP];
    const treeData = this.withHead(this.treeData, true);
    this.setExpandAll(treeData);
  }

  convertTrees(instances: any[], keys = ["_sub_system", "_businesses_APP"]) {
    if (isEmpty(instances)) return;

    for (const instance of instances) {
      let isLeaf = true;
      instance.key = instance.instanceId;
      instance.title = instance.name;
      instance.objectId = instance._object_id;
      for (const key of keys) {
        if (!isEmpty(instance[key])) {
          isLeaf = false;
          if (instance.children === undefined) {
            instance.children = [];
          }
          instance[key] = sortBy(instance[key], "name");
          instance.children = [...instance.children, ...instance[key]];
          this.convertTrees(instance[key]);
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
    // todo(ice): `BUSINESS[0]` ??
    const nodes = this.formatTreeNodes(data.BUSINESS[0], [
      "_sub_system",
      "_businesses_APP"
    ]);
    // eslint-disable-next-line require-atomic-updates
    treeNode.props.dataRef.children = nodes;
    this.setState({
      treeData: [...this.state.treeData],
      expandKeys: [instanceId, ...this.state.expandKeys]
    });
  }

  renderTitle(title: string): React.ReactNode {
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
      return <span className="ant-tree-title">{nodes.slice(0, -1)}</span>;
    }
    return <span className="ant-tree-title">{title}</span>;
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
            title={this.renderTitle(node.title)}
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
          title={this.renderTitle(node.title)}
          isLeaf={hasData ? isEmpty(node.children) : node.isLeaf}
          disabled={node.disabled}
          dataRef={node}
        />
      );
    });
  }

  onExpand(expandKeys: string[]) {
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
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
    ) : (
      <Tree
        key={this.state.key}
        selectedKeys={[this.props.selectedInstanceId]}
        draggable
        showIcon={this.props.showIcon}
        showLine
        className="hide-file-icon"
        onSelect={this.props.onSelect}
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
