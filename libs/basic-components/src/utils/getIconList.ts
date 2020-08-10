import { iconsByCategory as easyopsByCategory } from "@easyops/brick-icons";
import { fab, fas } from "@easyops/fontawesome-library";
import { kebabCase } from "lodash";
import { antdIconKeys } from './antdIcons';

export type IconType = "easyops" | "antd" | "fa";

const antdIconKeyPattern = /^([A-Za-z0-9]+)(Filled|Outlined|TwoTone)$/;

export interface GetIconListParams {
  q?: string;
  type?: IconType;
  page?: number;
  pageSize?: number;
}

export const antedThemeMap = {
  outline: "outlined",
  fill: "filled",
  twotone: "twoTone",
};

export function getIconList(params: GetIconListParams) {
  const { q = "", type = "easyops", page = 1, pageSize = 20 } = params;

  const iconList: any[] = [];

  if (type === "easyops") {
    for (const [key, icons] of Object.entries(easyopsByCategory)) {
      const list = icons.map((name) => ({
        title: name,
        descriptionList: [`category: ${key}`, `icon: ${name}`],
        icon: {
          lib: type,
          category: key,
          icon: name,
        },
      }));
      iconList.push(...list);
    }
  } else if (type === "antd") {
    antdIconKeys.forEach((key) => {
      let [, name, theme] = key.match(antdIconKeyPattern);

      name = kebabCase(name);

      switch (theme) {
        case "Filled":
          theme = "filled";
          break;
        case "Outlined":
          theme = "outlined";
          break;
        case "TwoTone":
          theme = "twoTone";
          break;
      }

      iconList.push({
        title: name,
        descriptionList: [`theme: ${theme}`, `icon: ${name}`],
        icon: {
          lib: type,
          icon: name,
          theme,
        },
      });
    });
  } else if (type === "fa") {
    const faByCategory = { ...fas, ...fab };

    for (const [, iconObj] of Object.entries(faByCategory)) {
      iconList.push({
        title: iconObj.iconName,
        descriptionList: [
          `prefix: ${iconObj.prefix}`,
          `icon: ${iconObj.iconName}`,
        ],
        icon: {
          lib: "fa",
          icon: iconObj.iconName,
          prefix: iconObj.prefix,
        },
      });
    }
  }

  // 先过滤关键字
  let filters = [];
  if (q === "") {
    filters = iconList;
  } else {
    const query = q.toLocaleLowerCase().trim();
    filters = iconList.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.descriptionList.find((i: string) =>
          i.toLowerCase().includes(query)
        )
    );
  }

  // 再进行分页
  const pageList = filters.slice((page - 1) * pageSize, page * pageSize);
  return {
    list: pageList,
    total: filters.length,
  };
}
