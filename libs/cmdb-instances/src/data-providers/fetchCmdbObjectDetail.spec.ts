import { fetchCmdbObjectDetail } from "./fetchCmdbObjectDetail";
import { CmdbObjectApi } from "@next-sdk/cmdb-sdk";
jest.mock("@next-sdk/cmdb-sdk");
import { mockFetchCmdbObjectDetailReturnValue } from "../__mocks__/fetchCmdbObjectDetail";

describe("fetchCmdbInstanceDetail", () => {
  it("should work", async () => {
    jest
      .spyOn(CmdbObjectApi, "getDetail")
      .mockResolvedValue(mockFetchCmdbObjectDetailReturnValue);
    const result = await fetchCmdbObjectDetail("HOST");
    expect(result).toEqual(mockFetchCmdbObjectDetailReturnValue);
  });
});
