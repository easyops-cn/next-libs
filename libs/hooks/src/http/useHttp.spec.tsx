import React from "react";
import { mount, shallow } from "enzyme";
import { HttpOptions, useHttp } from "./useHttp";
import * as kit from "@easyops/brick-kit";

const mockHttpApi = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnError = jest.fn();
const mockOnFinally = jest.fn();
const spyOnHandleHttpError = jest.spyOn(kit, "handleHttpError");

interface TestUseHttpComponentProps extends HttpOptions<any> {}
const TestUseHttpComponent = ({
  catchError = false,
  getter,
  onError,
  onFinally,
  onSuccess
}: TestUseHttpComponentProps) => {
  const { error, loading, data, reload } = useHttp(
    mockHttpApi,
    [{ name: "fakeName" }],
    {
      catchError: catchError,
      getter: getter || null,
      onError,
      onFinally,
      onSuccess
    }
  );
  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    return <span>Something went wrong！</span>;
  }

  if (!data) {
    return <span>No data!</span>;
  }

  return (
    <span onClick={() => reload([{ name: "newName" }])}>
      {(data as any).text}
    </span>
  );
};
describe("useHttp", () => {
  it("should work", async () => {
    mockHttpApi.mockResolvedValueOnce({ child: { text: "It's working!" } });
    const wrapper = mount(
      <TestUseHttpComponent
        onSuccess={mockOnSuccess}
        onFinally={mockOnFinally}
        getter={{ path: "child" }}
      />
    );
    expect(wrapper.text()).toBe("Loading...");
    await (global as any).flushPromises();
    expect(mockHttpApi).toHaveBeenCalledWith({ name: "fakeName" });
    expect(wrapper.text()).toBe("It's working!");
    expect(mockOnSuccess).toHaveBeenCalledWith({ text: "It's working!" });
    expect(mockOnFinally).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("should display error", async () => {
    mockHttpApi.mockRejectedValueOnce(new Error("Something went wrong！"));
    const wrapper = mount(
      <TestUseHttpComponent catchError={true} onError={mockOnError} />
    );
    expect(wrapper.text()).toBe("Loading...");
    await (global as any).flushPromises();

    expect(wrapper.text()).toBe("Something went wrong！");
    expect(spyOnHandleHttpError).toHaveBeenCalledWith(
      new Error("Something went wrong！")
    );
    expect(mockOnError).toHaveBeenCalledWith(
      new Error("Something went wrong！")
    );
  });

  it("should display noData", async () => {
    mockHttpApi.mockResolvedValueOnce(null);
    const wrapper = mount(<TestUseHttpComponent onFinally={mockOnFinally} />);
    expect(wrapper.text()).toBe("Loading...");
    await (global as any).flushPromises();

    expect(wrapper.text()).toBe("No data!");
    expect(mockOnFinally).toHaveBeenCalled();
  });

  it("should reload http function", async () => {
    mockHttpApi.mockResolvedValueOnce({ text: "It's working!" });
    const wrapper = mount(<TestUseHttpComponent />);
    expect(wrapper.text()).toBe("Loading...");
    await (global as any).flushPromises();
    expect(mockHttpApi).toHaveBeenCalledWith({ name: "fakeName" });
    expect(wrapper.text()).toBe("It's working!");

    mockHttpApi.mockResolvedValueOnce({ text: "reload successfully!" });
    wrapper.find("span").simulate("click");
    await (global as any).flushPromises();

    expect(mockHttpApi).toHaveBeenCalledWith({ name: "newName" });
    expect(wrapper.text()).toBe("reload successfully!");
  });
});
