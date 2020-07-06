import { iconsByCategory as easyopsByCategory } from "@easyops/brick-icons";
import { fab, fas } from "@easyops/fontawesome-library";
import antdByCategory from "@ant-design/icons/lib/manifest";

export type IconType = "easyops" | "antd" | "fa";

export interface GetIconListParams {
  q?: string;
  type?: IconType;
  page?: number;
  pageSize?: number;
}

export const antedThemeMap = {
  outline: "outlined",
  fill: "filled",
  twotone: "twoTone"
};

export function getIconList(params: GetIconListParams) {
  const { q = "", type = "easyops", page = 1, pageSize = 20 } = params;

  const iconList: any[] = [];

  if (type === "easyops") {
    for (const [key, icons] of Object.entries(easyopsByCategory)) {
      const list = icons.map(name => ({
        title: name,
        descriptionList: [`category: ${key}`, `icon: ${name}`],
        icon: {
          lib: type,
          category: key,
          icon: name
        }
      }));
      iconList.push(...list);
    }
  } else if (type === "antd") {
    for (const [key, icons] of Object.entries(antdByCategory)) {
      const list = icons.map(name => ({
        title: name,
        descriptionList: [
          `theme: ${antedThemeMap[key as keyof typeof antedThemeMap]}`,
          `icon: ${name}`
        ],
        icon: {
          lib: type,
          icon: name,
          theme: antedThemeMap[key as keyof typeof antedThemeMap]
        }
      }));
      iconList.push(...list);
    }
  } else if (type === "fa") {
    const faByCategory = { ...fas, ...fab };

    for (const [, iconObj] of Object.entries(faByCategory)) {
      iconList.push({
        title: iconObj.iconName,
        descriptionList: [
          `prefix: ${iconObj.prefix}`,
          `icon: ${iconObj.iconName}`
        ],
        icon: {
          lib: "fa",
          icon: iconObj.iconName,
          prefix: iconObj.prefix
        }
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
      item =>
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
    total: filters.length
  };
}
