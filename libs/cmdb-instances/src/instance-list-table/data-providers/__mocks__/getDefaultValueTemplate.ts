/* eslint-disable @typescript-eslint/camelcase */

export const mockGetDefaultValueTemplateValue = {
  _agentHeartBeat: -1,
  _agentStatus: "未安装",
  _environment: null,
  _mac: null,
  _occupiedU: null,
  _startU: null,
  _uuid: null,
  agentVersion: null,
  cpu: null,
  cpuHz: null,
  cpuModel: null,
  cpus: null,
  deviceId: "e1d3c5d6b20bc995ccdd8a9267a4f542",
  disk: null,
  diskSize: null,
  eth: null,
  hostname: null,
  incr3: "AHHH1351",
  ip: null,
  jjj: 0,
  "light-test-default-type2": null,
  memSize: null,
  memo: null,
  osArchitecture: null,
  osDistro: null,
  osRelease: null,
  osSystem: null,
  osVersion: null,
  provider: null,
  service: null,
  status: null,
  struct: null,
  tag: null
};

export const getDefaultValueTemplate = jest.fn(() =>
  Promise.resolve(mockGetDefaultValueTemplateValue)
);
