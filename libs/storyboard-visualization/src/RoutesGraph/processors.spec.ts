import {
  linkVerticalFactory,
  linkHorizontalFactory,
  getLinkPath
} from "./processors";
import { Edge } from "./interfaces";

describe("linkVerticalFactory", () => {
  it("linkVerticalFactory should equal the value", () => {
    const link = {
      source: { linkX: 0, linkY: 0 },
      target: { linkX: -350, linkY: 276.25 }
    };
    const path = "M0,0C0,138.125,-350,138.125,-350,276.25";
    expect(linkVerticalFactory(link)).toEqual(path);
  });
});
describe("linkHorizontalFactory", () => {
  it("linkHorizontalFactory should equal the value", () => {
    const link = {
      source: { linkX: 0, linkY: 0 },
      target: { linkX: -350, linkY: 276.25 }
    };
    const path = "M0,0C-175,0,-175,276.25,-350,276.25";
    expect(linkHorizontalFactory(link)).toEqual(path);
  });
});

describe("getLinkPath", () => {
  it.each<[Edge, string]>([
    [
      {
        source: { linkX: 0, linkY: 0, x: 10, y: 10 },
        target: { linkX: -350, linkY: 276.25, x: 110, y: 110 }
      },
      "M90,10C90,60,190,60,190,110"
    ],
    [
      {
        source: { linkX: 0, linkY: 0, x: 10, y: 10 },
        target: { linkX: -350, linkY: 276.25, x: 310, y: 310 }
      },
      "M90,222C90,266,390,266,390,310"
    ],
    [
      {
        source: { linkX: 0, linkY: 0, x: 10, y: 500 },
        target: { linkX: -350, linkY: 276.25, x: 310, y: 20 }
      },
      "M90,500C90,366,390,366,390,232"
    ],
    [
      {
        source: { linkX: 0, linkY: 0, x: 10, y: 10 },
        target: { linkX: -350, linkY: 276.25, x: 310, y: 110 }
      },
      "M170,116C240,116,240,216,310,216"
    ],
    [
      {
        source: { linkX: 0, linkY: 0, x: 500, y: 10 },
        target: { linkX: -350, linkY: 276.25, x: 20, y: 110 }
      },
      "M500,116C340,116,340,216,180,216"
    ]
  ])("getLinkPath(%j) should return %j", (data, path) => {
    expect(getLinkPath(data)).toBe(path);
  });
});
