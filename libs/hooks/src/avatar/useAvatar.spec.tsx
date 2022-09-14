import { act, renderHook } from "@testing-library/react-hooks";
import { UserAdminApi_searchAllUsersInfo } from "@next-sdk/user-service-sdk";
import useAvatar from "./useAvatar";

jest.mock("@next-sdk/user-service-sdk");

const consoleError = jest.spyOn(console, "error").mockImplementation();

const fakeUsers = [
  {
    name: "a",
    instanceId: "1",
    user_icon: "a.jpg",
  },
  {
    name: "b",
    instanceId: "2",
    user_icon: "b.jpg",
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

describe("useAvatar", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should work!", async () => {
    const { result, rerender, unmount } = renderHook(
      (nameOrInstanceId: string) => useAvatar(nameOrInstanceId),
      {
        initialProps: "a",
      }
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        user: null,
        loading: true,
      })
    );
    await jest.advanceTimersByTime(100);
    expect(result.current).toEqual(
      expect.objectContaining({ loading: true, user: null })
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        user: {
          name: "a",
          instanceId: "1",
          user_icon: "a.jpg",
        },
        loading: false,
      })
    );
    expect(result.current.Avatar.props.size).toEqual("default");
    // updateConfig

    result.current.updateConfig({ size: 20 });
    expect(result.current.Avatar.props.size).toEqual(20);
  });

  it("should work when error occurred", async () => {
    const { result, unmount } = renderHook(
      (nameOrInstanceId: string) => useAvatar(nameOrInstanceId),
      {
        initialProps: "c",
      }
    );
    await jest.advanceTimersByTime(100);
    expect(result.current).toEqual(
      expect.objectContaining({ loading: true, user: null })
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(consoleError).toBeCalledWith(
      "Load user info failed:",
      new Error("oops")
    );
    expect(result.current).toEqual(
      expect.objectContaining({ loading: false, user: null })
    );
    unmount();
  });
});
