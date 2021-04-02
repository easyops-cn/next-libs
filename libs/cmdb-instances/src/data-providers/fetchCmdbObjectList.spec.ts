import { fetchCmdbObjectList } from "./fetchCmdbObjectList";
import { CmdbObjectApi } from "@next-sdk/cmdb-sdk";
jest.mock("@next-sdk/cmdb-sdk");

describe("fetchCmdbObjectList", () => {
  it("should work", async () => {
    const mockGetObjectAll = CmdbObjectApi.getObjectAll as jest.Mock;
    mockGetObjectAll.mockImplementation(
      (params) => new Promise((resolve, reject) => resolve(params))
    );
    const result = await fetchCmdbObjectList();
    expect(result).toEqual({});
  });
});
