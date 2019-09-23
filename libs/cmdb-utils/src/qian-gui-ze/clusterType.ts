import { get, keyBy } from "lodash";

export const clusterTypeLabel = [
  {
    id: "0",
    name: "develop",
    label: "开发"
  },
  {
    id: "1",
    name: "test",
    label: "测试"
  },
  {
    id: "3",
    name: "prerelease",
    label: "预发布"
  },
  {
    id: "2",
    name: "production",
    label: "生产"
  },
  {
    id: "-1",
    name: "unbind",
    label: "未绑定集群"
  }
];
const x2yFnGenerator = (x: string, y: string) => (value: string) =>
  get(keyBy(clusterTypeLabel, x), [value, y]);

export const id2label = (id: string) => x2yFnGenerator("id", "label")("" + id);
