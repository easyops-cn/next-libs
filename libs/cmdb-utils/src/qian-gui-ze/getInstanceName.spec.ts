import { getInstanceName, getInstanceNameKey } from "./getInstanceName";
import { getRuntime } from "@easyops/brick-kit";

jest.mock("@easyops/brick-kit");

(getRuntime as jest.Mock).mockReturnValue({
  getFeatureFlags: () => {
    return {
      "config-show-key": true
    };
  }
});

describe("getInstanceNameKey", () => {
  const cases: [any, any, boolean, any][] = [
    [
      "HOST",
      {
        view: {
          show_key: "abc"
        }
      },
      true,
      "abc"
    ],
    ["HOST", "", true, "hostname"]
  ];

  it.each(cases)(
    "getInstanceNameKey(%s, %s, %b) should return '%s'",
    (objectId, model, showKey, expected) => {
      expect(getInstanceNameKey(objectId, model, showKey)).toBe(expected);
    }
  );
});

describe("getInstanceName", () => {
  const cases: [any, any, any, any][] = [
    [
      {
        hostname: "host1"
      },
      "HOST",
      [
        {
          objectId: "HOST"
        },
        {
          objectId: "APP"
        }
      ],
      "host1"
    ],
    [
      {
        a: "1",
        b: "2"
      },
      "APP",
      [
        {
          objectId: "HOST"
        },
        {
          objectId: "APP",
          view: {
            show_key: ["a", "b"]
          }
        }
      ],
      "1(2)"
    ]
  ];

  it.each(cases)(
    "getInstanceName(%s, %s, %b) should return '%s'",
    (instanceData, objectId, modelList, expected) => {
      expect(getInstanceName(instanceData, objectId, modelList)).toBe(expected);
    }
  );
});
