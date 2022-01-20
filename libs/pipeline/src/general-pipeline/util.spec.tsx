import { getPathByNodes } from "./util";

const data = [
  [
    "0,0",
    {
      offsetLeft: 100,
      offsetTop: 100,
      offsetWidth: 20,
      offsetHeight: 10,
    },
  ],
  [
    "1,0",
    {
      offsetLeft: 200,
      offsetTop: 100,
      offsetWidth: 20,
      offsetHeight: 10,
    },
  ],
  [
    "1,1",
    {
      offsetLeft: 200,
      offsetTop: 200,
      offsetWidth: 20,
      offsetHeight: 10,
    },
  ],
  [
    "2,0",
    {
      offsetLeft: 300,
      offsetTop: 100,
      offsetWidth: 20,
      offsetHeight: 10,
    },
  ],
];

describe("util", () => {
  it("getPathByNodes should work", () => {
    expect(getPathByNodes(data)).toEqual(
      "M110 105L210 105L210 205L252 205Q260 205 260 197L260 113Q260 105 268 105L310 105"
    );
  });
});
