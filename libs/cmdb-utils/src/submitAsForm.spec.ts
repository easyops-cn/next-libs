import { submitAsForm } from "./submitAsForm";

const mockSubmit = jest.fn();

HTMLFormElement.prototype.submit = mockSubmit;

describe("submitAsForm", () => {
  it("should work", () => {
    const params: any = {
      url: "/",
      data: { name: "irelia" }
    };
    submitAsForm(params);
    expect(mockSubmit).toBeCalled();
  });
});
