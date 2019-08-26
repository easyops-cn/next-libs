import { VisitHistory } from "./visit-history";
import moment from "moment";
const TIME_OFFSET = 0;
Date.now = jest.fn(() => +new Date("2019-05-10 17:51:00"));
const time = moment()
  .add(TIME_OFFSET)
  .format();

describe("VisitHistory", () => {
  let history: VisitHistory;

  beforeAll(() => {
    history = new VisitHistory("packages", "packageId", {});
    history.push({
      packageId: "335cf42dd50ba8b9a6ba69cf000c2172"
    });
  });

  it("can get latest record", () => {
    expect(history.latest(1)).toEqual([
      {
        packageId: "335cf42dd50ba8b9a6ba69cf000c2172",
        visitedAt: time
      }
    ]);
  });
  it("can get frequentlyVisited record", () => {
    expect(history.frequentlyVisited()).toEqual([
      {
        packageId: "335cf42dd50ba8b9a6ba69cf000c2172",
        visitedAt: time
      }
    ]);
  });
  it("can get all record", () => {
    expect(history.all()).toEqual([
      {
        packageId: "335cf42dd50ba8b9a6ba69cf000c2172",
        visitedAt: time
      }
    ]);
  });
  it("test clear", () => {
    history.clear();
    expect(history.all()).toEqual([]);
  });
  it("VisitHistory can call getNamespaceByCmdbObjectId", () => {
    expect(VisitHistory.getNamespaceByCmdbObjectId("APP")).toBe("apps");
    expect(VisitHistory.getNamespaceByCmdbObjectId("HOST")).toBe("devices");
    expect(
      VisitHistory.getNamespaceByCmdbObjectId(
        "335cf42dd50ba8b9a6ba69cf000c2172"
      )
    ).toBe("cmdb-335cf42dd50ba8b9a6ba69cf000c2172");
  });
  it("VisitHistory can call getNamespaceByQueryStrategyId", () => {
    expect(
      VisitHistory.getNamespaceByQueryStrategyId(
        "335cf42dd50ba8b9a6ba69cf000c2172"
      )
    ).toBe("cmdb-335cf42dd50ba8b9a6ba69cf000c2172-query-strategy");
  });

  it("should return the same record if construct new VisitHistory instances to get history", () => {
    const newHistory = new VisitHistory("packages", "packageId");

    expect(history.all()).toEqual(newHistory.all());
  });
});
