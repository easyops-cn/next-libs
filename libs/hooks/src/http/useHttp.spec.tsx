import React from "react";
import { mount, shallow } from "enzyme";
import { useHttp } from "./useHttp";

const mockHttpApi = jest.fn();

const TestUseHttpComponent = () => {
  const { error, loading, data, reload } = useHttp(mockHttpApi, [
    { name: "fakeName" }
  ]);
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
    mockHttpApi.mockResolvedValueOnce({ text: "It's working!" });
    const wrapper = mount(<TestUseHttpComponent />);
    expect(wrapper.text()).toBe("Loading...");
    await (global as any).flushPromises();
    expect(mockHttpApi).toHaveBeenCalledWith({ name: "fakeName" });
    expect(wrapper.text()).toBe("It's working!");
    wrapper.unmount();
  });

  it("should display error", async () => {
    mockHttpApi.mockRejectedValueOnce(new Error("Something went wrong！"));
    const wrapper = mount(<TestUseHttpComponent />);
    expect(wrapper.text()).toBe("Loading...");
    await (global as any).flushPromises();

    expect(wrapper.text()).toBe("Something went wrong！");
  });

  it("should display noData", async () => {
    mockHttpApi.mockResolvedValueOnce(null);
    const wrapper = mount(<TestUseHttpComponent />);
    expect(wrapper.text()).toBe("Loading...");
    await (global as any).flushPromises();

    expect(wrapper.text()).toBe("No data!");
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
