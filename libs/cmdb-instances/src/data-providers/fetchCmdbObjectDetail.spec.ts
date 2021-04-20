import { fetchCmdbObjectDetail } from "./fetchCmdbObjectDetail";
import { CmdbObjectApi_getDetail } from "@next-sdk/cmdb-sdk";
jest.mock("@next-sdk/cmdb-sdk");
import { mockFetchCmdbObjectDetailReturnValue } from "../__mocks__/fetchCmdbObjectDetail";

describe("fetchCmdbInstanceDetail", () => {
  it("should work", async () => {
    (CmdbObjectApi_getDetail as jest.Mock).mockResolvedValue(
      mockFetchCmdbObjectDetailReturnValue
    );
    const result = await fetchCmdbObjectDetail("HOST");
    expect(result).toEqual(mockFetchCmdbObjectDetailReturnValue);
  });
});
