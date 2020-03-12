import { groupBy } from "lodash";
import { Modal } from "antd";
import {
  BrickLifeCycle,
  BrickEventsMap,
  BrickConf
} from "@easyops/brick-types";
import { isObject } from "@easyops/brick-utils";
import { safeDump, JSON_SCHEMA, safeLoad } from "js-yaml";
import {
  StoryboardNodeBrick,
  StoryboardNodeBrickChild,
  StoryboardNodeSlottedBrick,
  RouteData,
  StoryboardNodeApp,
  StoryboardNodeSlottedRoutes,
  StoryboardNodeRoutedChild,
  StoryboardNodeSubRoutes
} from "../interfaces";

export interface BrickPatch {
  brick: string;
  properties: Record<string, any>;
  events?: BrickEventsMap;
  bg?: boolean;
  slots?: SlotsData;
  lifeCycle?: BrickLifeCycle;
}

interface SlotsData {
  [slotName: string]: SlotData;
}

interface SlotData {
  type: "routes" | "bricks";
  bricks?: SlottedBrickData[];
}

type SlottedBrickData = Pick<
  BrickConf,
  "brick" | "template" | "internalUsedBricks" | "internalUsedTemplates" | "if"
> & {
  _target?: number;
};

interface RouteDataPatch extends RouteData {
  _target?: number;
  type?: "routes" | "bricks" | "redirect";
}

interface RoutesPatch {
  routes: RouteDataPatch[];
}

export function brickNodeChildrenToSlots(
  nodes: StoryboardNodeBrickChild[]
): SlotsData {
  return Object.values(groupBy(nodes, "groupIndex")).reduce<SlotsData>(
    (acc, nodes) => {
      if (nodes[0].type === "routes") {
        acc[nodes[0].slotName] = {
          type: "routes"
        };
      } else {
        acc[nodes[0].slotName] = {
          type: "bricks",
          bricks: (nodes as StoryboardNodeSlottedBrick[]).map(
            (node, index) => ({
              _target: index,
              brick: node.brickData.brick,
              template: node.brickData.template,
              internalUsedBricks: node.brickData.internalUsedBricks,
              internalUsedTemplates: node.brickData.internalUsedTemplates,
              if: node.brickData.if
            })
          )
        };
      }
      return acc;
    },
    {}
  );
}

function slottedBrickPlaceholder(
  slotName: string,
  groupIndex: number
): StoryboardNodeSlottedBrick {
  return {
    type: "brick",
    brickType: "slotted",
    slotName,
    groupIndex,
    brickData: {
      brick: "div"
    }
  };
}

export function updateBrickNode(
  node: StoryboardNodeBrick,
  patch: BrickPatch
): void {
  const brickData = node.brickData;
  const { slots, ...rest } = patch;
  Object.assign(brickData, rest);
  delete brickData.template;
  delete brickData.params;
  if (!slots) {
    delete node.children;
    return;
  }
  const children: StoryboardNodeBrickChild[] = [];
  let groupIndex = 0;
  for (const [slotName, slotData] of Object.entries(slots)) {
    const matchedChildren = (node.children ?? []).filter(
      item =>
        item.type === (slotData.type === "routes" ? "routes" : "brick") &&
        item.slotName === slotName
    );
    if (matchedChildren.length > 0) {
      if (slotData.type === "bricks" && Array.isArray(slotData.bricks)) {
        children.push(
          ...slotData.bricks
            .map(item => {
              const matchedNode = matchedChildren[
                item._target
              ] as StoryboardNodeSlottedBrick;
              if (matchedNode) {
                matchedNode.groupIndex = groupIndex;
                if (item.template) {
                  delete matchedNode.brickData.brick;
                  delete matchedNode.brickData.properties;
                  delete matchedNode.brickData.bg;
                  delete matchedNode.children;
                  Object.assign(matchedNode.brickData, {
                    template: item.template
                  });
                } else if (item.brick) {
                  delete matchedNode.brickData.template;
                  delete matchedNode.brickData.params;
                  Object.assign(matchedNode.brickData, {
                    brick: item.brick
                  });
                }
                Object.assign(matchedNode.brickData, {
                  internalUsedBricks: item.internalUsedBricks,
                  internalUsedTemplates: item.internalUsedTemplates,
                  if: item.if
                });
                return matchedNode;
              }
              const placeholder = slottedBrickPlaceholder(slotName, groupIndex);
              if (item.brick) {
                placeholder.brickData.brick = item.brick;
              } else if (item.template) {
                delete placeholder.brickData.brick;
                placeholder.brickData.template = item.template;
              }
              return placeholder;
            })
            .filter(Boolean)
        );
      } else {
        children.push(
          ...matchedChildren.map(item => ({
            ...item,
            groupIndex: groupIndex
          }))
        );
      }
    } else {
      if (slotData.type === "bricks") {
        if (Array.isArray(slotData.bricks)) {
          children.push(
            ...slotData.bricks.map(item => {
              const placeholder = slottedBrickPlaceholder(slotName, groupIndex);
              if (item.brick) {
                placeholder.brickData.brick = item.brick;
              } else if (item.template) {
                delete placeholder.brickData.brick;
                placeholder.brickData.template = item.template;
              }
              return placeholder;
            })
          );
        } else {
          children.push(slottedBrickPlaceholder(slotName, groupIndex));
        }
      } else {
        children.push({
          type: "routes",
          routeType: "slotted",
          slotName,
          groupIndex: groupIndex,
          children: []
        });
      }
    }
    groupIndex += 1;
  }
  node.children = children;
}

export function routesNodeChildrenToRoutes(
  nodes: StoryboardNodeRoutedChild[]
): RouteDataPatch[] {
  return Object.values(groupBy(nodes, "groupIndex")).map(group => ({
    _target: group[0].groupIndex,
    ...group[0].routeData
  }));
}

export function updateRoutesNode(
  node:
    | StoryboardNodeApp
    | StoryboardNodeSubRoutes
    | StoryboardNodeSlottedRoutes,
  patch: RoutesPatch
): void {
  node.children = patch.routes.reduce<StoryboardNodeRoutedChild[]>(
    (acc, routeDataPatch, index) => {
      const { _target, type, ...routeData } = routeDataPatch;
      // Ensure `_target` and `type` match.
      const matchedChildren =
        _target !== undefined &&
        (node.children ?? []).filter(item => item.groupIndex === _target);
      if (matchedChildren && matchedChildren.length > 0) {
        acc.push(
          ...matchedChildren.map(item => ({
            ...item,
            routeData,
            groupIndex: index
          }))
        );
      } else if (type === "routes") {
        acc.push({
          type: "routes",
          routeType: "routed",
          routeData,
          children: [],
          groupIndex: index
        });
      } else if (type === "redirect") {
        acc.push({
          type: "redirect",
          routeData,
          groupIndex: index
        });
      } else {
        acc.push({
          type: "brick",
          brickType: "routed",
          routeData,
          brickData: {
            brick: "div"
          },
          groupIndex: index
        });
      }
      return acc;
    },
    []
  );
}

export function generalStringify(data: any, useYaml?: boolean): string {
  if (!data) {
    return "";
  }
  if (useYaml) {
    return safeDump(data, {
      schema: JSON_SCHEMA,
      skipInvalid: true,
      noRefs: true,
      noCompatMode: true
    });
  }
  return JSON.stringify(data, null, 2);
}

// Todo(steve): refine
export function generalParse(
  value: string,
  label: string,
  useYaml: boolean,
  type: "array" | "object" | "arrayOrObject" = "object"
): any {
  if (!value) {
    return;
  }
  let parsed: any;
  try {
    parsed = useYaml
      ? safeLoad(value, { schema: JSON_SCHEMA, json: true })
      : JSON.parse(value);
  } catch (e) {
    Modal.error({
      content: `请填写有效的${label} ${useYaml ? "YAML" : "JSON"} 串`
    });
    return false;
  }
  const parsedIsArray = Array.isArray(parsed);
  const parsedIsObject = isObject(parsed) && !parsedIsArray;
  if (
    type === "object"
      ? !parsedIsObject
      : type === "array"
      ? !parsedIsArray
      : !parsedIsArray && !parsedIsObject
  ) {
    Modal.error({
      content: `请填写有效的${label}`
    });
    return false;
  }
  return parsed;
}
