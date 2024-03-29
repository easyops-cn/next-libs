import { fetchCmdbObjectRef } from "./fetchCmdbObjectRef";
import { CmdbObjectApi_getObjectRef } from "@next-sdk/cmdb-sdk";
jest.mock("@next-sdk/cmdb-sdk");

describe("fetchCmdbObjectRef", () => {
  it("should work", async () => {
    const mockGetObjectRef = CmdbObjectApi_getObjectRef as jest.Mock;
    mockGetObjectRef.mockImplementation(
      (params) => new Promise((resolve, reject) => resolve(params))
    );
    const result = await fetchCmdbObjectRef("HOST");
    expect(result).toEqual({ ref_object: "HOST" });
  });
});
