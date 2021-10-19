import { TargetControlPointManager } from "./TargetControlPointManager";

describe("TargetControlPointManager", () => {
  it("should work", () => {
    const updateTargetControlPoint = TargetControlPointManager(
      new Proxy(
        {},
        {
          get(target, key) {
            return key;
          },
        }
      )
    );
    const wrapper = document.createElement("div");
    const top = document.createElement("div");
    const right = document.createElement("div");
    top.classList.add("controlPoint", "top");
    right.classList.add("controlPoint", "right");
    wrapper.appendChild(top);
    wrapper.appendChild(right);

    updateTargetControlPoint(wrapper, null);
    expect(Array.from(wrapper.querySelectorAll(".nearest"))).toEqual([]);

    updateTargetControlPoint(wrapper, "top");
    expect(Array.from(wrapper.querySelectorAll(".nearest"))).toEqual([top]);

    updateTargetControlPoint(wrapper, "right");
    expect(Array.from(wrapper.querySelectorAll(".nearest"))).toEqual([right]);

    updateTargetControlPoint(document.createElement("div"), null);
    expect(Array.from(wrapper.querySelectorAll(".nearest"))).toEqual([]);

    updateTargetControlPoint(null, null);
    expect(Array.from(wrapper.querySelectorAll(".nearest"))).toEqual([]);
  });
});
