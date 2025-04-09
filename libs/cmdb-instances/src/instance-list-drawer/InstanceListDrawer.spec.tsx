import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InstanceListDrawer } from "./InstanceListDrawer";

import { LegacyInstanceListWrapper } from "../instance-list/InstanceList";

import * as brickKit from "@next-core/brick-kit";

(jest.spyOn(brickKit, "getRuntime") as any).mockReturnValue({
  getMiscSettings: () => {
    return {
      defaultRelationLimit: 5,
    };
  },
});

// Mock LegacyInstanceListWrapper component
jest.mock("../instance-list/InstanceList", () => ({
  LegacyInstanceListWrapper: jest.fn(() => (
    <div data-testid="mock-instance-list" />
  )),
}));

// Mock InstanceListDrawer component
jest.mock("./InstanceListDrawer", () => {
  const originalModule = jest.requireActual("./InstanceListDrawer");
  return {
    ...originalModule,
    InstanceListDrawer: jest.fn((props) => {
      const { InstanceListDrawer: OriginalComponent } = originalModule;
      return <OriginalComponent {...props} />;
    }),
  };
});

interface InstanceListDrawerState {
  open: boolean;
  objectId: string;
  drawerTitle: string;
}

describe("InstanceListDrawer", () => {
  // 在 describe 块开始设置超时时间
  jest.setTimeout(30000);

  const defaultProps = {
    objectId: "HOST",
    drawerWidth: 800,
    drawerZIndex: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should work", async () => {
    render(<InstanceListDrawer {...defaultProps} />);
    expect(screen.getAllByTestId("mock-instance-list")?.length).toBe(1);
    expect(screen.queryByTestId("back-button")).toBeNull();
  });

  it("click more icon open drawer", () => {
    render(<InstanceListDrawer {...defaultProps} />);

    // 模拟点击关系图标
    const mockRecord = {
      objectId: "new-object-id",
      left_name: "测试标题",
    };

    const instanceListProps = (LegacyInstanceListWrapper as jest.Mock).mock
      .calls[0][0];
    instanceListProps.onRelationMoreIconClick(mockRecord);

    expect(screen.queryByTestId("back-button")).not.toBeNull();

    expect(screen.getByText("测试标题")).not.toBeNull();
  });

  it("drawer instanceList should work", () => {
    render(<InstanceListDrawer {...defaultProps} />);

    const mockRecord = {
      objectId: "new-object-id",
      left_name: "测试标题",
    };
    const instanceListProps = (LegacyInstanceListWrapper as jest.Mock).mock
      .calls[0][0];
    instanceListProps.onRelationMoreIconClick(mockRecord);

    expect(screen.getAllByTestId("mock-instance-list")).toHaveLength(2);
  });
});
