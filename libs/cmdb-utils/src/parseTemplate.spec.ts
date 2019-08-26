import { parseTemplate, getTemplateFromMap } from "./parseTemplate";

describe("parseTemplate", () => {
  it("parse the the key of data", () => {
    const url = "/next/product/#{instanceId}";
    const data = {
      instanceId: "232bda",
      name: "console"
    };

    const result = parseTemplate(url, data);

    expect(result).toEqual("/next/product/232bda");
  });

  it("parse the nested key of data", () => {
    const url = "/next/product/#{description.text}";
    const data = {
      instanceId: "232bda",
      name: "console",
      description: {
        title: "new-brick",
        text: "hello-words"
      }
    };
    const result = parseTemplate(url, data);

    expect(result).toEqual("/next/product/hello-words");
  });

  describe("getTemplateFromMap", () => {
    it("get the user value", () => {
      const data = { name: "console", text: "brick", default: "default" };
      const key = "name";

      const result = getTemplateFromMap(data, key);

      expect(result).toEqual("console");
    });

    it("get the default value", () => {
      const data = { name: "console", text: "brick", default: "default" };
      const key = "xxxx";

      const result = getTemplateFromMap(data, key);

      expect(result).toEqual("default");
    });
  });
});
