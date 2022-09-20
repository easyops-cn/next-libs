import {
  isAdvanceMode,
  mergeProperties,
  calculateValue,
  processFormValue,
  groupByType,
  isUseYamlParse,
  extractCommonProps,
  matchNoramlMenuValue,
} from "./processor";
import { groupI18nMap } from "./constant";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("@next-libs/code-editor-components", () => {});

describe("processor test", () => {
  describe("isAdvanceMode", () => {
    it.each([
      ["<% CTX.name %>", true],
      ["${QUERY.a}", true],
      ["abc", false],
      [true, false],
      [1234, false],
    ])("%s should return %p", (value, result) => {
      expect(isAdvanceMode(value)).toEqual(result);
    });
  });

  describe("mergeProperties", () => {
    it("should return empty if no params", () => {
      const result = mergeProperties();
      expect(result).toEqual([]);
    });

    it("should return merged properties", () => {
      const propertyList = [
        { name: "name", type: "string", description: "名称" },
        { name: "age", type: "number", description: "年龄" },
      ];

      const brickProperties = {
        name: "lucy",
        age: "<% CTX.age %>",
      };

      expect(mergeProperties(propertyList, brickProperties)).toEqual([
        {
          name: "name",
          type: "string",
          description: "名称",
          value: "lucy",
          mode: "normal",
        },
        {
          name: "age",
          type: "number",
          description: "年龄",
          value: "<% CTX.age %>",
          mode: "advanced",
        },
      ]);
    });
  });

  describe("calculateValue", () => {
    it("should return empty if no parmas", () => {
      const result = calculateValue();
      expect(result).toEqual({ others: "" });
    });
    it("should calculate init value", () => {
      const propertyList = [
        { name: "name", type: "string", description: "名称" },
        { name: "age", type: "number", description: "年龄" },
        { name: "nickname", type: "string", description: "昵称" },
        { name: "count", type: "number", description: "数量" },
        { name: "menu1", type: "Menu", description: "菜单一" },
        { name: "menu2", type: "SidebarSubMenu", description: "菜单二" },
        { name: "menu3", type: "Menu", description: "菜单三" },
        { name: "menu4", type: "SidebarSubMenu", description: "菜单四" },
        { name: "menu5", type: "Menu", description: "菜单五" },
        { name: "menu6", type: "Menu", description: "菜单六" },
        { name: "menu7", type: "Menu", description: "菜单七" },
        { name: "menu8", type: "Menu", description: "菜单八" },
      ];

      const brickProperties = {
        name: "lucy",
        age: 123,
        hobby: "run",
        category: "student",
        menu1: "<% APP.getMenu(menu-1) %>",
        menu2: "<% APP.getMenu('menu-2') %>",
        menu3: '<% APP.getMenu("menu-3") %>',
        menu4: "x",
        menu5: "<% APP.getMenu(menu-5 %>",
        menu6: undefined,
        menu7: {
          title: "menu-7",
          menuItems: {
            title: "menu-7-1",
            to: "/menu-7-1",
          },
        },
        menu8: [1, 2, 3],
      };
      const result = calculateValue(propertyList, brickProperties);
      expect(result).toEqual({
        age: 123,
        count: undefined,
        nickname: undefined,
        name: "lucy",
        others: "hobby: run\ncategory: student\n",
        menu1: "menu-1",
        menu2: "menu-2",
        menu3: "menu-3",
        menu4: "x",
        menu5: "<% APP.getMenu(menu-5 %>",
        menu6: undefined,
        menu7: {
          title: "menu-7",
          menuItems: {
            title: "menu-7-1",
            to: "/menu-7-1",
          },
        },
        menu8: [1, 2, 3],
      });
    });

    it("should calculate init value with complex parmas", () => {
      const propertyList = [
        { name: "name", type: "string", description: "名称" },
        { name: "age", type: "number", description: "年龄" },
        { name: "label", type: "LabelProps", description: "标签" },
      ];

      const brickProperties = {
        name: "lucy",
        age: 123,
        hot: true,
        hobby: "run",
        category: "<% CTX.category %>",
      };
      const result = calculateValue(propertyList, brickProperties);
      expect(result).toEqual({
        age: 123,
        name: "lucy",
        lable: undefined,
        others: "hot: true\nhobby: run\ncategory: <% CTX.category %>\n",
      });

      const brickProperties2 = {
        name: "lucy",
        age: 12,
        label: "name",
      };
      const result2 = calculateValue(propertyList, brickProperties2);

      expect(result2).toEqual({
        name: "lucy",
        age: 12,
        label: "name\n",
        others: "",
      });
    });
  });

  describe("processFormValue", () => {
    it("should return empty if no value", () => {
      const result = processFormValue();

      expect(result).toEqual({});
    });

    it("shuold return processed value", () => {
      const values = {
        name: "reuqired",
        label: "是否必填",
        options: "- true\n- false",
        type: "<% CTX.type %>",
        count: 234,
        required: true,
        others: "a: 3\nb: 4\ntest: true",
        menu1: "menu-1",
        menu2: "<% APP.getMenu('menu-2') %>",
        menu3: '<% APP.getMenu("menu-3") %>',
        menu4:
          'title: "menu-4"\nto: "/menu-4"\nmenuItems:\n  - title: "menu-4-1"',
      };

      const result = processFormValue(values, [
        { name: "options", type: "OptionsProps" },
        { name: "type", type: "string", mode: "advanced" },
        { name: "menu1", type: "Menu" },
        { name: "menu2", type: "SidebarSubMenu" },
        { name: "menu3", type: "Menu" },
        { name: "menu4", type: "Menu", mode: "advanced" },
      ]);

      expect(result).toEqual({
        name: "reuqired",
        label: "是否必填",
        options: [true, false],
        type: "<% CTX.type %>",
        count: 234,
        required: true,
        a: 3,
        b: 4,
        test: true,
        menu1: "<% APP.getMenu('menu-1') %>",
        menu2: "<% APP.getMenu('menu-2') %>",
        menu3: '<% APP.getMenu("menu-3") %>',
        menu4: {
          title: "menu-4",
          to: "/menu-4",
          menuItems: [
            {
              title: "menu-4-1",
            },
          ],
        },
      });
    });
  });

  describe("groupbyType", () => {
    it("should return empty if no value", () => {
      const result = groupByType();
      expect(result).toEqual([]);
    });

    it("should return new group", () => {
      const typeList = [
        {
          name: "name",
          type: "string",
          description: "名称",
          mode: "normal",
          group: "basic",
        },
        { name: "age", type: "number", description: "年龄", mode: "normal" },
        {
          name: "value",
          type: "Value",
          description: "值",
          mode: "advanced",
          group: "advanced",
        },
      ] as any;

      const result = groupByType(typeList);

      expect(result).toEqual([
        [
          "常用",
          [
            {
              name: "name",
              type: "string",
              description: "名称",
              mode: "normal",
              group: "basic",
            },
            {
              name: "age",
              type: "number",
              description: "年龄",
              mode: "normal",
            },
          ],
        ],
        [
          "高级",
          [
            {
              name: "value",
              type: "Value",
              description: "值",
              mode: "advanced",
              group: "advanced",
            },
          ],
        ],
      ]);
    });

    it("other should at the bottom of the category", () => {
      const typeList = [
        {
          name: "name",
          type: "string",
          description: "名称",
          mode: "normal",
          group: "basic",
        },
        {
          name: "hobby",
          type: "string",
          description: "名称",
          mode: "normal",
          group: "other",
        },
        {
          name: "test",
          type: "string",
          description: "测试",
          mode: "normal",
          group: "other",
        },
        { name: "age", type: "number", description: "年龄", mode: "normal" },
        {
          name: "value",
          type: "Value",
          description: "值",
          mode: "advanced",
          group: "advanced",
        },
      ] as any;

      const result = groupByType(typeList);

      expect(result).toEqual([
        [
          "常用",
          [
            {
              name: "name",
              type: "string",
              description: "名称",
              mode: "normal",
              group: "basic",
            },
            {
              name: "age",
              type: "number",
              description: "年龄",
              mode: "normal",
            },
          ],
        ],
        [
          "高级",
          [
            {
              name: "value",
              type: "Value",
              description: "值",
              mode: "advanced",
              group: "advanced",
            },
          ],
        ],
        [
          "其他",
          [
            {
              name: "hobby",
              type: "string",
              description: "名称",
              mode: "normal",
              group: "other",
            },
            {
              name: "test",
              type: "string",
              description: "测试",
              mode: "normal",
              group: "other",
            },
          ],
        ],
      ]);
    });

    it("should work with i18n", () => {
      const typeList = [
        {
          name: "name",
          type: "string",
          description: "名称",
          mode: "normal",
          group: "basic",
          groupI18N: {
            basic: {
              zh: "基本",
              en: "basic",
            },
            ui: {
              zh: "外观",
              en: "UI",
            },
          },
        },
        {
          name: "age",
          type: "number",
          description: "年龄",
          mode: "normal",
          group: "test",
          groupI18N: {
            basic: {
              zh: "基本",
              en: "basic",
            },
            ui: {
              zh: "外观",
              en: "UI",
            },
          },
        },
        {
          name: "value",
          type: "Value",
          description: "值",
          mode: "advanced",
          group: "advanced",
          groupI18N: {
            basic: {
              zh: "基本",
              en: "basic",
            },
            ui: {
              zh: "外观",
              en: "UI",
            },
          },
        },
      ] as any;

      const result = groupByType(typeList);

      expect(result).toEqual([
        [
          "基本",
          [
            {
              description: "名称",
              group: "basic",
              groupI18N: {
                basic: { en: "basic", zh: "基本" },
                ui: { en: "UI", zh: "外观" },
              },
              mode: "normal",
              name: "name",
              type: "string",
            },
          ],
        ],
        [
          "test",
          [
            {
              description: "年龄",
              group: "test",
              groupI18N: {
                basic: { en: "basic", zh: "基本" },
                ui: { en: "UI", zh: "外观" },
              },
              mode: "normal",
              name: "age",
              type: "number",
            },
          ],
        ],
        [
          "高级",
          [
            {
              description: "值",
              group: "advanced",
              groupI18N: {
                basic: { en: "basic", zh: "基本" },
                ui: { en: "UI", zh: "外观" },
              },
              mode: "advanced",
              name: "value",
              type: "Value",
            },
          ],
        ],
      ]);
    });
  });

  describe("useYamlParse", () => {
    it.each([
      [
        { key: "name", value: "tester" },
        [{ name: "name", type: "string", mode: "normal" }],
        false,
      ],
      [
        { key: "showCard", value: "${CTX.showCard}" },
        [{ name: "showCard", type: "boolean", mode: "advanced" }],
        true,
      ],
      [
        { key: "label", value: ["a", "b"] },
        [{ name: "label", type: "LabelProps" }],
        false,
      ],
      [
        { key: "options", value: "a: 3\nb: 4\n" },
        [{ name: "options", type: "OptionsProps" }],
        true,
      ],
      [
        { key: "color", value: "#efefef" },
        [{ name: "color", type: "Color", mode: "normal" }],
        false,
      ],
      [{ key: "tooltips", value: "some text" }, [], false],
      [{ key: "others", value: "label: name\nvalue: tester\n" }, [], true],
    ])("%s and %p should return %s", (field, typeList, result) => {
      expect(isUseYamlParse(field, typeList)).toEqual(result);
    });
  });

  describe("extractCommonProps", () => {
    it("should extra common properties", () => {
      const typeList = [
        {
          name: "name",
          type: "string",
          description: "名称",
        },
        {
          name: "age",
          type: "number",
          description: "年龄",
        },
      ];

      const result = extractCommonProps(typeList);
      expect(result).toEqual([
        {
          name: "id",
          type: "string",
          description: "构件 ID",
          group: "basic",
          groupI18N: groupI18nMap,
        },
        {
          name: "style",
          type: "Record<string, any>",
          description: "构件样式",
          group: "ui",
          groupI18N: groupI18nMap,
        },
        {
          name: "name",
          type: "string",
          description: "名称",
        },
        {
          name: "age",
          type: "number",
          description: "年龄",
        },
      ]);
    });

    it("should return empty array if typeList is empty", () => {
      const result = extractCommonProps([]);
      expect(result).toEqual([]);
    });

    it("matchNoramlMenuValue should work", () => {
      const result1 = matchNoramlMenuValue("menu-1");
      expect(result1).toBe("menu-1");

      const result2 = matchNoramlMenuValue("<% APP.getMenu('menu-2') %>");
      expect(result2).toBe("menu-2");

      const result3 = matchNoramlMenuValue('<% APP.getMenu("menu-3") %>');
      expect(result3).toBe("menu-3");

      const result4 = matchNoramlMenuValue('<% APP.getMenu("menu-4 %>');
      expect(result4).toBe('<% APP.getMenu("menu-4 %>');

      const result5 = matchNoramlMenuValue(undefined);
      expect(result5).toBe(undefined);

      const result6 = matchNoramlMenuValue({ a: 1 });
      expect(result6).toEqual({ a: 1 });
    });
  });
});
