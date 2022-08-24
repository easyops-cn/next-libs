import { fetchCmdbInstanceSearch } from "./fetchCmdbInstanceSearch";
import { InstanceApi_postSearchV3 } from "@next-sdk/cmdb-sdk";
jest.mock("@next-sdk/cmdb-sdk");
import { mockFetchCmdbInstanceSearch } from "../__mocks__/fetchCmdbInstanceSearch";

describe("fetchCmdbInstanceSearch", () => {
  it("should work", async () => {
    (InstanceApi_postSearchV3 as jest.Mock).mockResolvedValue(
      mockFetchCmdbInstanceSearch
    );
    const result = await fetchCmdbInstanceSearch("TPS", {
      fields: ["iip", "note", "age", "name", "iftrue", "iprice", "score"],
      ignore_missing_field_error: true,
      page: 4332,
      page_size: 10,
      query: { "own_host.instanceId": { $eq: "5e3116e27168d" } },
    });
    expect(result).toEqual(mockFetchCmdbInstanceSearch);
  });
});
