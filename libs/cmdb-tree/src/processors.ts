import { isEmpty, cloneDeep } from "lodash";
import { TreeNode } from "./CMDBTree";

export function transformToTreeData(objectList: any[]): TreeNode[] {
  const categories = ["应用资源", "平台资源", "基础设施", "组织信息"];
  const map: any = { others: [] };
  for (const object of objectList) {
    object.key = object.objectId;
    object.title = object.name;
    object.type = "object";

    const category: string = object.category;
    if (category) {
      const tags = category.split(".", 2);
      if (categories.includes(tags[0])) {
        if (map[tags[0]] === undefined) {
          map[tags[0]] = {};
        }
        if (tags.length === 1) {
          tags.push("other-tag");
        }

        if (map[tags[0]][tags[1]] === undefined) {
          map[tags[0]][tags[1]] = [];
        }
        map[tags[0]][tags[1]].push(object);
      } else {
        if (map[category] === undefined) {
          map[category] = [];
        }
        map[category].push(object);
      }
    } else {
      map.others.push(object);
    }
  }

  const ret: TreeNode[] = [];
  for (const category of categories) {
    const children: TreeNode[] = [];
    if (map[category]) {
      for (const tag of Object.keys(map[category])) {
        if (tag !== "other-tag") {
          children.push({
            key: `${category}.${tag}`,
            title: tag,
            type: "tag",
            children: map[category][tag]
          });
        }
      }
      if (map[category]["other-tag"]) {
        children.push(...map[category]["other-tag"]);
      }
    }

    ret.push({
      key: category,
      title: category,
      type: "category",
      children
    });
  }

  for (const key of Object.keys(map)) {
    if (categories.includes(key)) {
      continue;
    }

    ret.push(...map[key]);
  }
  return ret;
}

function match(treeNode: TreeNode, q: string): boolean {
  const str = q.toLowerCase();
  if (isEmpty(treeNode.children)) {
    if (
      treeNode.key.toLowerCase().includes(str) ||
      treeNode.title.toLowerCase().includes(str)
    ) {
      return true;
    }
    return false;
  }

  if (
    treeNode.key.toLowerCase().includes(str) ||
    treeNode.title.toLowerCase().includes(str)
  ) {
    return true;
  }
  treeNode.children = treeNode.children.filter(node => match(node, q));
  return !isEmpty(treeNode.children);
}

export function search(treeData: TreeNode[], q: string): TreeNode[] {
  const nodes = cloneDeep(treeData);
  const result: TreeNode[] = [];
  for (const treeNode of nodes) {
    if (match(treeNode, q)) {
      result.push(treeNode);
    }
  }

  return result;
}
