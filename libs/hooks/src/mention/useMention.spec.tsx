import { act, renderHook } from "@testing-library/react-hooks";
import { UserAdminApi_searchAllUsersInfo } from "@next-sdk/user-service-sdk";
import useMention from "./useMention";
import { InstanceApi_postSearchV3 } from "@next-sdk/cmdb-sdk";

jest.mock("@next-sdk/cmdb-sdk");

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

(InstanceApi_postSearchV3 as jest.Mock).mockImplementation(
  (objectId, { query }: { query: any }) => {
    // Fake matching.
    const list = fakeUsers
      .filter((user) => query.$or[0].name.$like === `%${user.name}%`)
      .map((item) => ({ ...item }));
    return list.length > 0
      ? Promise.resolve({
          list,
        })
      : Promise.reject(new Error("oops"));
  }
);

describe("useMention", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should work!", async () => {
    const { result, rerender, unmount } = renderHook(
      (nameOrInstanceId: string) => useMention(nameOrInstanceId),
      {
        initialProps: "a",
      }
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        users: [],
        loading: true,
      })
    );
    await jest.advanceTimersByTime(100);
    expect(result.current).toEqual(
      expect.objectContaining({ loading: true, users: [] })
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        users: [
          {
            name: "a",
            instanceId: "1",
            user_icon: "a.jpg",
          },
        ],
        loading: false,
      })
    );

    result.current.updateUserName("b");
    await jest.advanceTimersByTime(400);
    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(result.current).toEqual(
      expect.objectContaining({
        loading: false,
        users: [
          {
            name: "b",
            instanceId: "2",
            user_icon: "b.jpg",
          },
        ],
      })
    );

    result.current.updateUserName("");
    rerender();
    await jest.advanceTimersByTime(400);
    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(result.current).toEqual(
      expect.objectContaining({ loading: false, users: [] })
    );
  });

  it("should work when error occurred", async () => {
    const { result, unmount } = renderHook(
      (nameOrInstanceId: string) => useMention(nameOrInstanceId),
      {
        initialProps: "c",
      }
    );
    expect(result.current).toEqual(
      expect.objectContaining({ loading: true, users: [] })
    );
    await jest.advanceTimersByTime(100);

    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(consoleError).toBeCalledWith(
      "Load user info failed:",
      new Error("oops")
    );
    expect(result.current).toEqual(
      expect.objectContaining({ loading: false, users: [] })
    );
    unmount();
  });
});
