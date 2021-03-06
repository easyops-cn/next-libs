import React, { useState, useRef, useEffect } from "react";
import Icon from "@ant-design/icons";
import { Tree, Input } from "antd";
import { TreeProps, AntTreeNodeProps } from "antd/lib/tree";
import { MenuIcon } from "@next-core/brick-types";
import { GeneralIcon } from "@next-libs/basic-components";

type TreeIcon = MenuIcon | React.ComponentType<React.SVGAttributes<SVGElement>>;

function isMenuIcon(icon: TreeIcon): icon is MenuIcon {
  return (icon as MenuIcon).lib !== undefined;
}

export type SearchableTreeNodeProps = Omit<AntTreeNodeProps, "children"> & {
  title?: string;
  icon?: TreeIcon;
  children?: SearchableTreeNodeProps[];
};

export interface SearchableTreeProps {
  selectedKeys?: string[];
  checkedKeys?: string[];
  expandedKeys?: string[];
  configProps?: Omit<
    TreeProps,
    "selectedKeys" | "checkedKeys" | "expandedKeys"
  >;
  dataSource: SearchableTreeNodeProps[];
  searchable?: boolean;
  onSelect?(selectedKeys: React.Key[]): void;
  onCheck?(
    checkedKeys:
      | React.Key[]
      | { checked: React.Key[]; halfChecked: React.Key[] }
  ): void;
}

export function SearchableTree(props: SearchableTreeProps): React.ReactElement {
  const {
    selectedKeys: _selectedKeys,
    checkedKeys: _checkedKeys,
    expandedKeys: _expandedKeys,
    configProps = {},
    dataSource = [],
    searchable = false,
  } = props;
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>();
  const [checkedKeys, setCheckedKeys] = useState<
    | React.Key[]
    | {
        checked: React.Key[];
        halfChecked: React.Key[];
      }
  >();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>();
  const [searchValue, setSearchValue] = useState<string>();
  const nodeMatchedRef = useRef<boolean>(false);

  useEffect(() => {
    setSelectedKeys(_selectedKeys);
  }, [_selectedKeys]);
  useEffect(() => {
    setCheckedKeys(_checkedKeys);
  }, [_checkedKeys]);
  useEffect(() => {
    setExpandedKeys(_expandedKeys);
  }, [_expandedKeys]);

  let searchValueLength: number;

  if (searchValue) {
    searchValueLength = searchValue.length;
  }

  const getExpandedKeysBySearchValue = (
    nodes: SearchableTreeNodeProps[],
    searchValue: string,
    expandedKeys: string[]
  ) => {
    let isHit = false;

    nodes.forEach((node) => {
      if (node.children) {
        if (
          getExpandedKeysBySearchValue(node.children, searchValue, expandedKeys)
        ) {
          expandedKeys.push(node.key);
          isHit = true;
        }
      } else {
        if (node.title.includes(searchValue)) {
          expandedKeys.push(node.key);
          isHit = true;
        }
      }
    });

    return isHit;
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSearchValue(value);
    nodeMatchedRef.current = false;

    if (value) {
      const expandedKeys: string[] = [];

      getExpandedKeysBySearchValue(dataSource, value, expandedKeys);
      setExpandedKeys(expandedKeys);
    }
  };

  const onSelect = (selectedKeys: React.Key[]) => {
    setSelectedKeys(selectedKeys);

    if (props.onSelect) {
      props.onSelect(selectedKeys);
    }
  };

  const onCheck = (
    checkedKeys:
      | React.Key[]
      | { checked: React.Key[]; halfChecked: React.Key[] }
  ) => {
    setCheckedKeys(checkedKeys);

    if (props.onCheck) {
      props.onCheck(checkedKeys);
    }
  };

  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  const getTreeNodes = (list: SearchableTreeNodeProps[]) => {
    return list.map((item) => {
      const { children, title: _title, icon: _icon, key, ...itemProps } = item;
      let title: React.ReactNode = _title;
      let icon: React.ReactNode;

      if (searchValue && !children) {
        const index = _title.indexOf(searchValue);

        if (index >= 0) {
          const beforeStr = _title.substring(0, index);
          const afterStr = _title.substring(searchValueLength + index);

          title = (
            <span
              ref={(() => {
                if (!nodeMatchedRef.current) {
                  nodeMatchedRef.current = true;

                  return (el: HTMLElement) => {
                    if (el) {
                      (
                        el.closest(".ant-tree-node-content-wrapper") || el
                      ).scrollIntoView();
                    }
                  };
                } else {
                  return null;
                }
              })()}
            >
              {beforeStr}
              <span style={{ color: "#0071eb", backgroundColor: "#e6f7ff" }}>
                {searchValue}
              </span>
              {afterStr}
            </span>
          );
        }
      }

      if (isMenuIcon(_icon)) {
        icon = <GeneralIcon icon={_icon} />;
      } else {
        icon = <Icon component={_icon} />;
      }

      return (
        <Tree.TreeNode {...itemProps} title={title} icon={icon} key={key}>
          {children && getTreeNodes(children)}
        </Tree.TreeNode>
      );
    });
  };

  return (
    <>
      {searchable && (
        <Input.Search
          onChange={onChange}
          style={{ marginBottom: 8 }}
          data-testid="search-input"
        />
      )}
      <div style={{ overflow: "auto" }}>
        <Tree
          {...configProps}
          selectedKeys={selectedKeys}
          checkedKeys={checkedKeys}
          expandedKeys={expandedKeys}
          onSelect={onSelect}
          onCheck={onCheck}
          onExpand={onExpand}
        >
          {getTreeNodes(dataSource)}
        </Tree>
      </div>
    </>
  );
}
