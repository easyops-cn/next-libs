import { isEmpty, cloneDeep, get } from "lodash";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
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
            children: map[category][tag],
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
      children,
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
  treeNode.children = treeNode.children.filter((node) => match(node, q));
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

function getRelationObjectId(
  relations: Partial<CmdbModels.ModelObjectRelation>[],
  id: string
): string {
  let objectId = "";
  for (const relation of relations) {
    if (relation.left_id == id) {
      objectId = relation.right_object_id;
      break;
    } else if (relation.right_id == id) {
      objectId = relation.left_object_id;
      break;
    }
  }

  return objectId;
}

export function getObjectId2ShowKeys(
  objectList: CmdbModels.ModelCmdbObject[]
): Map<string, string[]> {
  const map = new Map();
  for (const model of objectList) {
    const showKeys = get(model, "view.show_key", ["name", "ip"]);
    map.set(model.objectId, showKeys);
  }
  return map;
}

export function fixRequestFields(
  objectList: CmdbModels.ModelCmdbObject[],
  request: CmdbModels.ModelInstanceTreeRootNode,
  notFixed: boolean,
  checkWhiteList: boolean
): string[] {
  const fields = new Set<string>();

  const objectId = request.object_id;
  const objectId2ShowKeys = getObjectId2ShowKeys(objectList);
  if (notFixed) {
    const reqFields = request.fields;
    if (reqFields) {
      for (const [key, value] of Object.entries(reqFields)) {
        if (value) {
          fields.add(key);
        }
      }
    }
  } else {
    const showKeys = objectId2ShowKeys.get(objectId);
    if (showKeys) {
      request.fields = {};
      if (checkWhiteList) {
        request.fields.readAuthorizers = true;
        request.fields.inheritedReadAuthorizers = true;
      }
      for (const showKey of showKeys) {
        request.fields[showKey] = true;
        fields.add(showKey);
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`objectId '${objectId}' does NOT exist`);
    }
  }
  let map = new Map<string, CmdbModels.ModelInstanceTreeRootNode["child"]>();
  map.set(objectId, request.child);
  while (map.size > 0) {
    const childMap = new Map<
      string,
      CmdbModels.ModelInstanceTreeRootNode["child"]
    >();
    for (const [objectId, child] of map) {
      if (child?.length) {
        const model = objectList.find((o) => o.objectId == objectId);
        if (!model) {
          continue;
        }
        for (const c of child) {
          const id = getRelationObjectId(
            model.relation_list,
            c.relation_field_id
          );
          if (id) {
            childMap.set(id, c.child);
            if (notFixed) {
              const childFields = c.fields;
              if (childFields) {
                for (const [key, value] of Object.entries(childFields)) {
                  if (value) {
                    fields.add(key);
                  }
                }
              }
            } else {
              const showKeys = objectId2ShowKeys.get(id);
              c.fields = {};
              if (checkWhiteList) {
                c.fields.readAuthorizers = true;
                request.fields.inheritedReadAuthorizers = true;
              }
              for (const showKey of showKeys) {
                c.fields[showKey] = true;
                fields.add(showKey);
              }
            }
          } else {
            // eslint-disable-next-line no-console
            console.warn(
              `relation '${c.relation_field_id}' does NOT exist in '${objectId}'`
            );
          }
        }
      }
    }
    map = childMap;
  }

  return [...fields];
}

export function getTitle(
  instance: Record<string, any>,
  showKeys: string[]
): string {
  let title = get(instance, showKeys[0], "unknown");
  if (showKeys.length > 1 && get(instance, showKeys[1])) {
    title += `(${instance[showKeys[1]]})`;
  }
  return title;
}

export function getObjectIds(
  objectList: CmdbModels.ModelCmdbObject[],
  request: CmdbModels.ModelInstanceTreeRootNode
): string[] {
  const objectIds = new Set<string>();
  const objectId = request.object_id;
  let map = new Map<string, CmdbModels.ModelInstanceTreeRootNode["child"]>();
  map.set(objectId, request.child);
  objectIds.add(objectId);
  while (map.size > 0) {
    const childMap = new Map<
      string,
      CmdbModels.ModelInstanceTreeRootNode["child"]
    >();
    for (const [objectId, child] of map) {
      if (child?.length) {
        const model = objectList.find((o) => o.objectId == objectId);
        if (!model) {
          continue;
        }
        for (const c of child) {
          const id = getRelationObjectId(
            model.relation_list,
            c.relation_field_id
          );
          if (id) objectIds.add(id);
          childMap.set(id, c.child);
        }
      }
    }
    map = childMap;
  }

  return [...objectIds];
}

export function getRelation2ObjectId(
  objectList: CmdbModels.ModelCmdbObject[],
  request: CmdbModels.ModelInstanceTreeRootNode
): Map<string, string> {
  const ret = new Map<string, string>();
  const objectId = request.object_id;
  let map = new Map<string, CmdbModels.ModelInstanceTreeRootNode["child"]>();
  map.set(objectId, request.child);
  while (map.size > 0) {
    const childMap = new Map<
      string,
      CmdbModels.ModelInstanceTreeRootNode["child"]
    >();
    for (const [objectId, child] of map) {
      if (child?.length) {
        const model = objectList.find((o) => o.objectId == objectId);
        if (!model) {
          continue;
        }
        for (const c of child) {
          const id = getRelationObjectId(
            model.relation_list,
            c.relation_field_id
          );
          ret.set(c.relation_field_id, objectId);
          childMap.set(id, c.child);
        }
      }
    }
    map = childMap;
  }

  return ret;
}

export function updateChildren(
  instanceId: string,
  treeData: any,
  nodes: any[]
) {
  let data = treeData;
  while (data.length) {
    const children = [];
    for (const item of data) {
      if (item.key === instanceId) {
        item.children = nodes;
      }
      if (item.children) {
        children.push(...item.children);
      }
    }
    data = children;
  }
}
export function checkPermission(
  whiteList: string[],
  currentUser: string,
  userGroupIds: string[]
) {
  if (!isEmpty(whiteList)) {
    const userGroupIdSet = new Set(userGroupIds);
    return whiteList.some((i) => i === currentUser || userGroupIdSet.has(i));
  } else {
    return true;
  }
}
export function removeNoPermissionNode(tree: TreeNode[]): void {
  for (let i = tree.length - 1; i >= 0; i--) {
    const { authorized, children } = tree[i];
    if (children) {
      removeNoPermissionNode(children);
    }
    if (!authorized && !children?.length) {
      tree.splice(i, 1);
    }
  }
}
