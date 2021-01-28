import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SearchableTree } from "./SearchableTree";
import { FaIcon } from "@next-core/brick-types";

const dataSource = [
  {
    title: "0",
    key: "0",
    icon: { lib: "fa", icon: "briefcase" } as FaIcon,
    children: [
      {
        title: "0-0",
        key: "00",
        icon: { lib: "fa", icon: "cube" } as FaIcon,
      },
      {
        title: "0-1",
        key: "01",
        icon: { lib: "fa", icon: "briefcase" } as FaIcon,
        children: [
          {
            title: "0-1-0",
            key: "010",
            icon: { lib: "fa", icon: "briefcase" } as FaIcon,
            children: [
              {
                title: "0-1-0-1",
                key: "0101",
                icon: { lib: "fa", icon: "cube" } as FaIcon,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "1",
    key: "1",
    icon: { lib: "fa", icon: "briefcase" } as FaIcon,
    children: [
      {
        title: "1-0",
        key: "10",
        icon: { lib: "fa", icon: "cube" } as FaIcon,
      },
    ],
  },
];

describe("SearchableTree", () => {
  it("should work", () => {
    const { asFragment } = render(<SearchableTree dataSource={dataSource} />);
    expect(asFragment()).toBeTruthy();
  });

  it("should expand the nodes that match search value", () => {
    const { asFragment, getByTestId, getByText, getAllByText } = render(
      <SearchableTree dataSource={dataSource} searchable />
    );

    fireEvent.change(getByTestId("search-input"), { target: { value: "1-0" } });
    expect(asFragment()).toBeTruthy();

    const mockScrollIntoView = getAllByText("1-0")[0].scrollIntoView;

    expect(mockScrollIntoView).toBeCalledTimes(1);
    fireEvent.click(getByText("0"));
    expect(mockScrollIntoView).toBeCalledTimes(1);
  });
});
