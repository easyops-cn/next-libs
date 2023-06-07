import { parseTemplate, getTemplateFromMap } from "./parseTemplate";

describe("parseTemplate", () => {
  it("parse the the key of data", () => {
    const url = "/next/product/#{instanceId}";
    const data = {
      instanceId: "232bda",
      name: "console",
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
        text: "hello-words",
      },
    };
    const result = parseTemplate(url, data);

    expect(result).toEqual("/next/product/hello-words");
  });

  it("parse the array element in data", () => {
    const url = "/next/product/#{arr[0].name}/#{arr[2]}";
    const data = {
      instanceId: "232bda",
      name: "console",
      arr: [
        {
          name: "hello",
        },
        {
          name: "world",
        },
      ],
    };
    const skipUndefined = true;
    const result = parseTemplate(url, data, skipUndefined);

    expect(result).toEqual("/next/product/hello/#{arr[2]}");
  });

  it("skip the key not found", () => {
    const url = "/next/product/#{description.comment}";
    const data = {
      instanceId: "232bda",
      name: "console",
      description: {
        title: "new-brick",
        text: "hello-words",
      },
    };
    const skipUndefined = true;
    const result = parseTemplate(url, data, skipUndefined);

    expect(result).toEqual("/next/product/#{description.comment}");
  });

  it("do not skip the key not found", () => {
    const url = "/next/product/#{description.comment}";
    const data = {
      instanceId: "232bda",
      name: "console",
      description: {
        title: "new-brick",
        text: "hello-words",
      },
    };
    const result = parseTemplate(url, data);

    expect(result).toEqual("/next/product/");
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
