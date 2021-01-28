import { renderHook, act } from "@testing-library/react-hooks";
import { createMemoryHistory } from "history";

import { useConfirmToLeave } from "./useConfirmToLeave";
import { getHistory } from "@next-core/brick-kit";

jest.mock("@next-core/brick-kit");
const mockGetUserConfirmation = jest.fn();
const memHistory = createMemoryHistory({
  getUserConfirmation: mockGetUserConfirmation,
});
const mockGetHistory = getHistory as jest.Mock;
mockGetHistory.mockImplementation(() => memHistory);

describe("useConfirmToLeave", () => {
  it("should block", () => {
    const shouldBlockRef: any = { current: true };
    const { unmount } = renderHook(() => useConfirmToLeave(shouldBlockRef));
    const event = new Event("beforeunload");
    const mockPreventDefault = jest.spyOn(event, "preventDefault");
    window.dispatchEvent(event);
    expect(mockPreventDefault).toBeCalled();

    memHistory.push("/a/b/c");
    expect(mockGetUserConfirmation).toBeCalled();

    const spy = jest.spyOn(window, "removeEventListener");
    unmount();
    expect(spy).toBeCalled();
  });

  it("should not block", () => {
    const shouldBlockRef: any = { current: false };
    renderHook(() => useConfirmToLeave(shouldBlockRef));

    const event = new Event("beforeunload");
    const mockPreventDefault = jest.spyOn(event, "preventDefault");
    window.dispatchEvent(event);
    expect(mockPreventDefault).not.toBeCalled();

    mockGetUserConfirmation.mockClear();
    memHistory.push("/a/b/c");
    expect(mockGetUserConfirmation).not.toBeCalled();
  });
});
