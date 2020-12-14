import React from "react";
import { Menu } from "antd";
import { MenuTheme } from "antd/lib/menu/MenuContext";
import { uniq } from "lodash";
import { UnregisterCallback, Location, parsePath } from "history";
import { getHistory } from "@easyops/brick-kit";
import { matchPath } from "@easyops/brick-utils";
import {
  SidebarMenuSimpleItem,
  SidebarMenuItem,
  SidebarMenuGroup,
} from "@easyops/brick-types";
import { Link } from "./Link";
import { GeneralIcon } from "./GeneralIcon";
import style from "./Sidebar.module.css";

interface SidebarProps {
  menuItems: SidebarMenuItem[];
  theme?: MenuTheme;
  inlineIndent?: number;
  collapsed?: boolean;
}

interface SidebarState {
  location: Location;
}

function isGroup(item: SidebarMenuItem): item is SidebarMenuGroup {
  return item.type === "group";
}

function isSubMenu(item: SidebarMenuItem): item is SidebarMenuGroup {
  return item.type === "subMenu";
}

export function initMenuItemAndMatchCurrentPathKeys(
  menuItems: SidebarMenuItem[],
  pathname: string,
  search: string,
  parentCursor: string
): {
  selectedKeys: string[];
  openedKeys: string[];
} {
  const selectedKeys: string[] = [];
  const openedKeys: string[] = [];

  let cursor = 0;
  menuItems.forEach((item) => {
    // key的格式最终为0,1,2,0.1,0.2,0.1.1,0.1.2
    item.key = parentCursor === "" ? `${cursor}` : `${parentCursor}.${cursor}`;
    if (isGroup(item) || isSubMenu(item)) {
      const tmp = initMenuItemAndMatchCurrentPathKeys(
        item.items,
        pathname,
        search,
        item.key
      );
      selectedKeys.push(...tmp.selectedKeys);
      if (tmp.selectedKeys.length || item.defaultExpanded) {
        openedKeys.push(item.key);
      }
      openedKeys.push(...tmp.openedKeys);
    } else {
      if (matchMenuItem(item, pathname, search)) {
        selectedKeys.push(String(item.key));
      }
    }
    cursor += 1;
  });
  if (selectedKeys.length && parentCursor !== "") {
    openedKeys.push(parentCursor);
  }
  return {
    selectedKeys: selectedKeys,
    openedKeys: openedKeys,
  };
}

export function matchMenuItem(
  item: SidebarMenuSimpleItem,
  pathname: string,
  search: string
): boolean {
  if (!item.to) return false;
  const to = typeof item.to === "object" ? item.to : parsePath(item.to);

  // Regex taken from: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202
  const escapedPath = to.pathname.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");

  let match = !!matchPath(pathname, {
    path: escapedPath,
    exact: item.exact,
  });

  if (!match && Array.isArray(item.activeIncludes)) {
    for (const include of item.activeIncludes) {
      match = !!matchPath(pathname, {
        path: include,
        exact: true,
      });
      if (match) {
        break;
      }
    }
  }

  if (match && Array.isArray(item.activeExcludes)) {
    for (const include of item.activeExcludes) {
      match = !matchPath(pathname, {
        path: include,
        exact: true,
      });
      if (!match) {
        break;
      }
    }
  }

  if (match && (item as any).activeMatchSearch) {
    const toSearch = new URLSearchParams(to.search);
    const currentSearch = new URLSearchParams(search);
    for (const [key, value] of toSearch.entries()) {
      if (currentSearch.get(key) !== value) {
        match = false;
        break;
      }
    }
  }

  return match;
}

export class Sidebar extends React.Component<SidebarProps, SidebarState> {
  private unlisten: UnregisterCallback;

  constructor(props: SidebarProps) {
    super(props);
    const history = getHistory();

    this.state = {
      location: history.location,
    };

    this.unlisten = history.listen((location) => {
      this.setState({
        location,
      });
    });
  }

  componentWillUnmount(): void {
    this.unlisten();
  }

  private renderSimpleMenuItem(
    item: SidebarMenuSimpleItem,
    ignoreTitle?: boolean
  ): React.ReactNode {
    return (
      <Menu.Item
        key={String(item.key)}
        title={ignoreTitle ? undefined : item.text}
      >
        <Link to={item.to} href={item.href} target={item.target}>
          {item.icon && (
            <i className={style.menuItemIcon}>
              <GeneralIcon icon={item.icon} />
            </i>
          )}
          <span className={style.menuItemText}>{item.text}</span>
        </Link>
      </Menu.Item>
    );
  }

  private renderGroupMenu(item: SidebarMenuGroup): React.ReactNode {
    return (
      <Menu.ItemGroup key={item.key} title={item.title}>
        {item.items.map((innerItem) => this.renderMenuItem(innerItem))}
      </Menu.ItemGroup>
    );
  }

  private renderSubMenu(item: SidebarMenuGroup): React.ReactNode {
    return (
      <Menu.SubMenu
        key={item.key}
        title={
          <span>
            {item.icon && (
              <i className={style.menuItemIcon}>
                <GeneralIcon icon={item.icon} />
              </i>
            )}
            <span className={style.menuItemText}>{item.title}</span>
          </span>
        }
      >
        {/* Items in sub-menu should ignore their titles. */}
        {item.items.map((innerItem) => this.renderMenuItem(innerItem, true))}
      </Menu.SubMenu>
    );
  }

  private renderMenuItem(
    item: SidebarMenuItem,
    ignoreTitle?: boolean
  ): React.ReactNode {
    return isSubMenu(item)
      ? this.renderSubMenu(item)
      : isGroup(item)
      ? this.renderGroupMenu(item)
      : this.renderSimpleMenuItem(item, ignoreTitle);
  }

  render(): React.ReactNode {
    const { pathname, search } = this.state.location;
    const { selectedKeys, openedKeys } = initMenuItemAndMatchCurrentPathKeys(
      this.props.menuItems,
      pathname,
      search,
      ""
    );
    return (
      <Menu
        mode="inline"
        theme={this.props.theme}
        inlineIndent={this.props.inlineIndent}
        defaultOpenKeys={uniq(openedKeys)}
        defaultSelectedKeys={selectedKeys}
        selectedKeys={selectedKeys}
        style={{ borderRight: 0 }}
        className={style.menuContainer}
        inlineCollapsed={this.props.collapsed}
      >
        {this.props.menuItems.map((item) => this.renderMenuItem(item))}
      </Menu>
    );
  }
}
