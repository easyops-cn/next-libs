import { ExtendedMarker, HighlightTokenType } from "../interfaces";
import { getClickableMarker as _getClickableMarker } from "./getClickableMarker";

const platformGetter = jest.spyOn(window.navigator, "platform", "get");

const markers: ExtendedMarker[] = [
  {
    className: "highlight-marker",
    endCol: 12,
    endRow: 1,
    highlightType: "storyboard-context",
    identifier: "abc",
    inFront: true,
    startCol: 5,
    startRow: 1,
    type: "text",
  },
  {
    className: "highlight-marker",
    endCol: 19,
    endRow: 1,
    highlightType: "storyboard-function",
    identifier: "def",
    inFront: true,
    startCol: 13,
    startRow: 1,
    type: "text",
  },
];

describe("getClickableMarker on mac", () => {
  let getClickableMarker: typeof _getClickableMarker;
  beforeAll(() => {
    jest.isolateModules(() => {
      platformGetter.mockReturnValue("MacIntel");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require("./getClickableMarker");
      getClickableMarker = module.getClickableMarker;
    });
  });

  it.each<{
    e: any;
    clickableTypes: HighlightTokenType[];
    result: Partial<ExtendedMarker>;
  }>([
    {
      e: {
        domEvent: { metaKey: false, ctrlKey: true },
      },
      clickableTypes: ["storyboard-function"],
      result: undefined,
    },
    {
      e: {
        domEvent: { metaKey: true },
        getDocumentPosition() {
          return { row: 1, column: 1 };
        },
      },
      clickableTypes: ["storyboard-function"],
      result: undefined,
    },
    {
      e: {
        domEvent: { metaKey: true },
        getDocumentPosition() {
          return { row: 1, column: 14 };
        },
      },
      clickableTypes: ["storyboard-function"],
      result: {
        identifier: "def",
      },
    },
    {
      e: {
        domEvent: { metaKey: true },
        getDocumentPosition() {
          return { row: 1, column: 14 };
        },
      },
      clickableTypes: ["storyboard-context"],
      result: undefined,
    },
  ])("should work", ({ e, clickableTypes, result }) => {
    (window as any).navigator = { platform: "MacIntel" };

    const received = getClickableMarker(e, clickableTypes, markers);
    if (result) {
      expect(received).toMatchObject(result);
    } else {
      expect(received).toBe(result);
    }
  });
});

describe("getClickableMarker on others", () => {
  let getClickableMarker: typeof _getClickableMarker;
  beforeAll(() => {
    jest.isolateModules(() => {
      platformGetter.mockReturnValue("Windows95");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require("./getClickableMarker");
      getClickableMarker = module.getClickableMarker;
    });
  });

  it.each<{
    e: any;
    clickableTypes: HighlightTokenType[];
    result: Partial<ExtendedMarker>;
  }>([
    {
      e: {
        domEvent: { ctrlKey: false, metaKey: true },
      },
      clickableTypes: ["storyboard-context"],
      result: undefined,
    },
    {
      e: {
        domEvent: { ctrlKey: true },
        getDocumentPosition() {
          return { row: 1, column: 1 };
        },
      },
      clickableTypes: ["storyboard-context"],
      result: undefined,
    },
    {
      e: {
        domEvent: { ctrlKey: true },
        getDocumentPosition() {
          return { row: 1, column: 5 };
        },
      },
      clickableTypes: ["storyboard-context"],
      result: {
        identifier: "abc",
      },
    },
    {
      e: {
        domEvent: { metaKey: true },
        getDocumentPosition() {
          return { row: 1, column: 5 };
        },
      },
      clickableTypes: ["storyboard-function"],
      result: undefined,
    },
  ])("should work", ({ e, clickableTypes, result }) => {
    (window as any).navigator = { platform: "MacIntel" };

    const received = getClickableMarker(e, clickableTypes, markers);
    if (result) {
      expect(received).toMatchObject(result);
    } else {
      expect(received).toBe(result);
    }
  });
});
