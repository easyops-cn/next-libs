import { fetchCmdbInstanceDetail } from "./fetchCmdbInstanceDetail";
import { InstanceApi } from "@next-sdk/cmdb-sdk";
jest.mock("@next-sdk/cmdb-sdk");
import { mockFetchCmdbInstanceDetailReturnValue } from "../__mocks__/fetchCmdbInstanceDetail";

describe("fetchCmdbInstanceDetail", () => {
  it("should work", async () => {
    jest
      .spyOn(InstanceApi, "getDetail")
      .mockResolvedValue(mockFetchCmdbInstanceDetailReturnValue);
    const result = await fetchCmdbInstanceDetail("HOST", "58312af20a20d");
    expect(result).toEqual(mockFetchCmdbInstanceDetailReturnValue);
  });
});
