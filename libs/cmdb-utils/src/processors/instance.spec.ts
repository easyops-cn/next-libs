import { getInstanceNameKeys } from "./instance";
import { DefaultNameKey } from "../constants";

describe("getInstanceNameKeys", () => {
  it("should work", () => {
    expect(getInstanceNameKeys()).toEqual([DefaultNameKey]);
    expect(
      getInstanceNameKeys({
        objectId: "USER"
      })
    ).toEqual([DefaultNameKey]);
    expect(
      getInstanceNameKeys({
        objectId: "USER",
        view: {}
      })
    ).toEqual([DefaultNameKey]);
    expect(
      getInstanceNameKeys({
        objectId: "USER",
        view: {
          show_key: ["nickname", "email"]
        }
      })
    ).toEqual(["nickname", "email"]);
  });

  it('should return "hostname" when objectId is "HOST"', () => {
    expect(
      getInstanceNameKeys({
        objectId: "HOST"
      })
    ).toEqual(["hostname"]);
    expect(
      getInstanceNameKeys({
        objectId: "HOST",
        view: {}
      })
    ).toEqual(["hostname"]);
    expect(
      getInstanceNameKeys({
        objectId: "HOST",
        view: {
          show_key: ["hostname", "ip"]
        }
      })
    ).toEqual(["hostname", "ip"]);
  });
});
