import React from "react";
import { mount } from "enzyme";
import { useModal } from "./useModal";

const MockModalComponent = (props: { visible: boolean }) => {
  return <div>mock modal</div>;
};
const TestUseModalComponent = (props: { visible?: boolean }) => {
  const { isVisible, openModal, closeModal } = useModal({
    initialVisible: props.visible
  });

  return (
    <>
      <MockModalComponent visible={isVisible} />
      {/* eslint-disable-next-line react/no-string-refs */}
      <span data-ref={"openModalRef"} onClick={openModal}>
        openModal
      </span>
      {/* eslint-disable-next-line react/no-string-refs */}
      <span data-ref={"closeModalRef"} onClick={closeModal}>
        closeModal
      </span>
    </>
  );
};
describe("useModal", () => {
  it("should work", () => {
    const wrapper = mount(<TestUseModalComponent />);
    expect(wrapper.find(MockModalComponent).prop("visible")).toBe(false);
  });

  it("should display modal when initialValue is true", () => {
    const wrapper = mount(<TestUseModalComponent visible={true} />);
    expect(wrapper.find(MockModalComponent).prop("visible")).toBe(true);
  });

  it("should open modal when called openModal function", () => {
    const wrapper = mount(<TestUseModalComponent />);
    expect(wrapper.find(MockModalComponent).prop("visible")).toBe(false);

    wrapper.find("span[data-ref='openModalRef']").simulate("click");
    wrapper.update();
    expect(wrapper.find(MockModalComponent).prop("visible")).toBe(true);
  });

  it("should closed modal when called closeModal function", () => {
    const wrapper = mount(<TestUseModalComponent visible={true} />);
    expect(wrapper.find(MockModalComponent).prop("visible")).toBe(true);

    wrapper.find("span[data-ref='closeModalRef']").simulate("click");
    wrapper.update();
    expect(wrapper.find(MockModalComponent).prop("visible")).toBe(false);
  });
});
