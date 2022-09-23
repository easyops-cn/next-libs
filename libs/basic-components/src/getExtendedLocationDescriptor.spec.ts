import { getExtendedLocationDescriptor } from "./getExtendedLocationDescriptor";

describe("getExtendedLocationDescriptor", () => {
  it("should work without search and keepCurrentSearch", () => {
    const loc = getExtendedLocationDescriptor(
      {
        pathname: "/abc",
      },
      {
        pathname: "/xyz",
        search: "?r=0",
        hash: "#prev",
        state: undefined,
      }
    );
    expect(loc).toEqual({
      pathname: "/abc",
    });
  });

  it("should work without keepCurrentSearch = false", () => {
    const loc = getExtendedLocationDescriptor(
      {
        pathname: "/abc",
        search: "?q=1",
        hash: "#next",
        keepCurrentSearch: false,
      },
      {
        pathname: "/xyz",
        search: "?r=0",
        hash: "#prev",
        state: undefined,
      }
    );
    expect(loc).toEqual({
      pathname: "/abc",
      search: "?q=1",
      hash: "#next",
    });
  });

  it("should work with keepCurrentSearch = true", () => {
    const loc = getExtendedLocationDescriptor(
      {
        pathname: "/abc",
        keepCurrentSearch: true,
      },
      {
        pathname: "/xyz",
        search: "?r=0&s=2",
        hash: "#prev",
        state: undefined,
      }
    );
    expect(loc).toEqual({
      pathname: "/abc",
      search: "?r=0&s=2",
    });
  });

  it("should work with keepCurrentSearch = true and with search", () => {
    const loc = getExtendedLocationDescriptor(
      {
        pathname: "/abc",
        search: "?q=1",
        hash: "#next",
        keepCurrentSearch: true,
      },
      {
        pathname: "/xyz",
        search: "?r=0",
        hash: "#prev",
        state: undefined,
      }
    );
    expect(loc).toEqual({
      pathname: "/abc",
      search: "?q=1&r=0",
      hash: "#next",
    });
  });

  it("should work with keepCurrentSearch = true and with search while result in no search", () => {
    const loc = getExtendedLocationDescriptor(
      {
        pathname: "/abc",
        search: "",
        keepCurrentSearch: true,
      },
      {
        pathname: "/xyz",
        search: "",
        hash: "#prev",
        state: undefined,
      }
    );
    expect(loc).toEqual({
      pathname: "/abc",
      search: "",
    });
  });

  it("should work with keepCurrentSearch = ['s']", () => {
    const loc = getExtendedLocationDescriptor(
      {
        pathname: "/abc",
        search: "?q=1",
        hash: "#next",
        keepCurrentSearch: ["s"],
      },
      {
        pathname: "/xyz",
        search: "?r=0&s=2",
        hash: "#prev",
        state: undefined,
      }
    );
    expect(loc).toEqual({
      pathname: "/abc",
      search: "?q=1&s=2",
      hash: "#next",
    });
  });
});
