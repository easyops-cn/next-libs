import { act, renderHook } from "@testing-library/react-hooks";
import { UserAdminApi_searchAllUsersInfo } from "@next-sdk/user-service-sdk";
import { useUserInfoByNameOrInstanceId } from "./useUserInfoByNameOrInstanceId";

jest.mock("@next-sdk/user-service-sdk");

const consoleError = jest.spyOn(console, "error").mockImplementation();

const fakeUsers = [
  {
    name: "a",
    instanceId: "1",
  },
  {
    name: "b",
    instanceId: "2",
  },
];

(UserAdminApi_searchAllUsersInfo as jest.Mock).mockImplementation(
  ({ query }: { query: any }) => {
    // Fake matching.
    const list = fakeUsers
      .filter(
        (user) =>
          query.$or[0].name.$in.some((name: string) => name === user.name) ||
          query.$or[1].instanceId.$in.some(
            (instanceId: string) => instanceId === user.instanceId
          )
      )
      .map((item) => ({ ...item }));
    return list.length > 0
      ? Promise.resolve({
          list,
        })
      : Promise.reject(new Error("oops"));
  }
);

describe("useUserInfoByNameOrInstanceId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should work", async () => {
    const { result, rerender, unmount } = renderHook(
      (nameOrInstanceId: string) =>
        useUserInfoByNameOrInstanceId(nameOrInstanceId),
      {
        initialProps: "a",
      }
    );
    await jest.advanceTimersByTime(100);
    expect(result.current).toBe(null);
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(result.current).toEqual({
      name: "a",
      instanceId: "1",
    });

    rerender("b");
    expect(result.current).toBe(null);
    await jest.advanceTimersByTime(100);
    expect(result.current).toBe(null);
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(result.current).toEqual({
      name: "b",
      instanceId: "2",
    });
    unmount();
    expect(consoleError).not.toBeCalled();
  });

  it("should work concurrently", async () => {
    const { result: result1, unmount: unmount1 } = renderHook(
      (nameOrInstanceId: string) =>
        useUserInfoByNameOrInstanceId(nameOrInstanceId),
      {
        initialProps: "a",
      }
    );
    const { result: result2, unmount: unmount2 } = renderHook(
      (nameOrInstanceId: string) =>
        useUserInfoByNameOrInstanceId(nameOrInstanceId),
      {
        initialProps: "b",
      }
    );
    await jest.advanceTimersByTime(100);
    expect(result1.current).toBe(null);
    expect(result2.current).toBe(null);
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(result1.current).toEqual({
      name: "a",
      instanceId: "1",
    });
    expect(result2.current).toEqual({
      name: "b",
      instanceId: "2",
    });
    unmount1();
    unmount2();
    expect(consoleError).not.toBeCalled();
  });

  it("should handle unsubscribed", async () => {
    const { result, unmount } = renderHook(
      (nameOrInstanceId: string) =>
        useUserInfoByNameOrInstanceId(nameOrInstanceId),
      {
        initialProps: "a",
      }
    );
    await jest.advanceTimersByTime(50);
    expect(result.current).toBe(null);
    // Unmount early.
    unmount();
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(result.current).toBe(null);
  });

  it("should work when input is null", async () => {
    const { result, unmount } = renderHook(
      (nameOrInstanceId: string) =>
        useUserInfoByNameOrInstanceId(nameOrInstanceId),
      {
        initialProps: null,
      }
    );
    await jest.advanceTimersByTime(100);
    expect(result.current).toBe(null);
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(result.current).toBe(null);
    unmount();
    expect(consoleError).not.toBeCalled();
  });

  it("should work when error occurred", async () => {
    const { result, unmount } = renderHook(
      (nameOrInstanceId: string) =>
        useUserInfoByNameOrInstanceId(nameOrInstanceId),
      {
        initialProps: "c",
      }
    );
    await jest.advanceTimersByTime(100);
    expect(result.current).toBe(null);
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(consoleError).toBeCalledWith(
      "Load user info failed:",
      new Error("oops")
    );
    expect(result.current).toBe(null);
    unmount();
  });
});
