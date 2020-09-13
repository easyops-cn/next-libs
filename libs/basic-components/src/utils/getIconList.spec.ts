import { getIconList, GetIconListParams } from "./getIconList";

jest.mock("@easyops/brick-icons", () => ({
  iconsByCategory: {
    app: ["all-cmdb", "brick-group"],
    model: ["business", "cloud-host"],
  },
}));

jest.mock("@easyops/fontawesome-library", () => ({
  fab: {
    fa500px: {
      prefix: "fab",
      iconName: "500px",
    },
    faAccusoft: {
      prefix: "fab",
      iconName: "accusoft",
    },
  },
  fas: {
    faAd: {
      prefix: "fas",
      iconName: "ad",
    },
    faAddressBook: {
      prefix: "fas",
      iconName: "address-book",
    },
  },
}));

jest.mock("./antdIcons", () => ({
  antdIconKeys: [
  "AccountBookFilled",
  "AlertOutlined",
  "ApiTwoTone",
  ]
}));

describe("GetIconList", () => {
  it.each<[GetIconListParams, any]>([
    [
      {},
      {
        list: [
          {
            title: "all-cmdb",
            descriptionList: ["category: app", "icon: all-cmdb"],
            icon: {
              category: "app",
              icon: "all-cmdb",
              lib: "easyops",
            },
          },
          {
            title: "brick-group",
            descriptionList: ["category: app", "icon: brick-group"],
            icon: {
              category: "app",
              icon: "brick-group",
              lib: "easyops",
            },
          },
          {
            title: "business",
            descriptionList: ["category: model", "icon: business"],
            icon: {
              category: "model",
              icon: "business",
              lib: "easyops",
            },
          },
          {
            title: "cloud-host",
            descriptionList: ["category: model", "icon: cloud-host"],
            icon: {
              category: "model",
              icon: "cloud-host",
              lib: "easyops",
            },
          },
        ],
        total: 4,
      },
    ],
    [
      {
        type: "easyops",
        page: 1,
        pageSize: 2,
      },
      {
        list: [
          {
            title: "all-cmdb",
            descriptionList: ["category: app", "icon: all-cmdb"],
            icon: {
              category: "app",
              icon: "all-cmdb",
              lib: "easyops",
            },
          },
          {
            title: "brick-group",
            descriptionList: ["category: app", "icon: brick-group"],
            icon: {
              category: "app",
              icon: "brick-group",
              lib: "easyops",
            },
          },
        ],
        total: 4,
      },
    ],
    [
      {
        q: "tttttt",
        type: "easyops",
        page: 1,
        pageSize: 2,
      },
      {
        list: [],
        total: 0,
      },
    ],
    [
      {
        q: "all-cmdb",
        type: "easyops",
        page: 1,
        pageSize: 20,
      },
      {
        list: [
          {
            title: "all-cmdb",
            descriptionList: ["category: app", "icon: all-cmdb"],
            icon: {
              category: "app",
              icon: "all-cmdb",
              lib: "easyops",
            },
          },
        ],
        total: 1,
      },
    ],
    [
      {
        type: "antd",
      },
      {
        list: [
          {
            title: "account-book",
            descriptionList: ["theme: filled", "icon: account-book"],
            icon: {
              icon: "account-book",
              theme: "filled",
              lib: "antd",
            },
          },
          {
            title: "alert",
            descriptionList: ["theme: outlined", "icon: alert"],
            icon: {
              icon: "alert",
              theme: "outlined",
              lib: "antd",
            },
          },
          {
            title: "api",
            descriptionList: ["theme: twoTone", "icon: api"],
            icon: {
              icon: "api",
              theme: "twoTone",
              lib: "antd",
            },
          },
        ],
        total: 3,
      },
    ],
    [
      {
        type: "fa",
      },
      {
        list: [
          {
            title: "ad",
            descriptionList: ["prefix: fas", "icon: ad"],
            icon: {
              icon: "ad",
              lib: "fa",
              prefix: "fas",
            },
          },
          {
            title: "address-book",
            descriptionList: ["prefix: fas", "icon: address-book"],
            icon: {
              icon: "address-book",
              lib: "fa",
              prefix: "fas",
            },
          },
          {
            title: "500px",
            descriptionList: ["prefix: fab", "icon: 500px"],
            icon: {
              icon: "500px",
              lib: "fa",
              prefix: "fab",
            },
          },
          {
            title: "accusoft",
            descriptionList: ["prefix: fab", "icon: accusoft"],
            icon: {
              icon: "accusoft",
              lib: "fa",
              prefix: "fab",
            },
          },
        ],
        total: 4,
      },
    ],
  ])("GetIconList(%j) should work", (params, result) => {
    expect(getIconList(params)).toEqual(result);
  });
});
