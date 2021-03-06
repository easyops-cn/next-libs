import { InstanceApi } from "@next-sdk/cmdb-sdk";

export const fetchCmdbInstanceAggregateCount = jest.fn(() =>
  Promise.resolve([
    { count: 12, attr: { modifier: "easyops" } },
    { count: 40, attr: { modifier: null } },
    { count: 3, attr: { modifier: "defaultUser" } },
  ])
);
