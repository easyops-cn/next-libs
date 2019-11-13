import { InstanceApi } from "@sdk/cmdb-sdk";

/* eslint-disable @typescript-eslint/camelcase */

export const fetchCmdbInstanceAggregateCount = jest.fn(() =>
  Promise.resolve([
    { count: 12, attr: { modifier: "easyops" } },
    { count: 40, attr: { modifier: null } },
    { count: 3, attr: { modifier: "defaultUser" } }
  ])
);
