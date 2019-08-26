import React from "react";
import { Menu } from "antd";
import { UnregisterCallback, Location, LocationDescriptor } from "history";
import { getHistory } from "@easyops/brick-kit";
import { matchPath } from "@easyops/brick-utils";
import { Link } from "./Link";
import { MenuTheme } from "antd/lib/menu/MenuContext";

interface SidebarProps {
  menuItems: SidebarMenuItem[];
  theme?: MenuTheme;
}

interface SidebarState {
  location: Location;
}

export type SidebarMenuItemType = "default" | "group";

export type SidebarMenuItem = SidebarMenuSimpleItem | SidebarMenuGroup;

export interface SidebarMenuSimpleItem {
  text: string;
  to: LocationDescriptor;
  type?: "default";
  exact?: boolean;
  activeIncludes?: string[];
  activeExcludes?: string[];
  key?: string;
}

export interface SidebarMenuGroup {
  type: "group";
  title: string;
  items: SidebarMenuSimpleItem[];
  key?: string;
}

function isGroup(item: SidebarMenuItem): item is SidebarMenuGroup {
  return item.type === "group";
}

export class Sidebar extends React.Component<SidebarProps, SidebarState> {
  private unlisten: UnregisterCallback;

  constructor(props: SidebarProps) {
    super(props);
    const history = getHistory();

    this.state = {
      location: history.location
    };

    this.unlisten = history.listen(location => {
      this.setState({
        location
      });
    });
  }

  componentWillUnmount(): void {
    this.unlisten();
  }

  private matchMenuItem(
    item: SidebarMenuSimpleItem,
    pathname: string,
    selectedKeys: string[]
  ): void {
    const path = typeof item.to === "object" ? item.to.pathname : item.to;

    // Regex taken from: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202
    const escapedPath = path.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");

    let match = !!matchPath(pathname, {
      path: escapedPath,
      exact: item.exact
    });

    if (!match && Array.isArray(item.activeIncludes)) {
      for (const include of item.activeIncludes) {
        match = !!matchPath(pathname, {
          path: include,
          exact: true
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
          exact: true
        });
        if (!match) {
          break;
        }
      }
    }

    if (match) {
      selectedKeys.push(String(item.key));
    }
  }

  render(): React.ReactNode {
    const { pathname } = this.state.location;
    const selectedKeys: string[] = [];
    let cursor = 0;
    this.props.menuItems.forEach(item => {
      if (isGroup(item)) {
        item.key = String(cursor);
        cursor += 1;
        item.items.forEach(innerItem => {
          innerItem.key = String(cursor);
          cursor += 1;
          this.matchMenuItem(innerItem, pathname, selectedKeys);
        });
      } else {
        item.key = String(cursor);
        cursor += 1;
        this.matchMenuItem(item, pathname, selectedKeys);
      }
    });

    return (
      <Menu
        mode="inline"
        theme={this.props.theme}
        selectedKeys={selectedKeys}
        style={{ height: "100%", borderRight: 0 }}
      >
        {this.props.menuItems.map(item =>
          isGroup(item) ? (
            <Menu.ItemGroup key={item.key} title={item.title}>
              {item.items.map(innerItem => (
                <Menu.Item key={String(innerItem.key)}>
                  <Link to={innerItem.to}>{innerItem.text}</Link>
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          ) : (
            <Menu.Item key={String(item.key)}>
              <Link to={item.to}>{item.text}</Link>
            </Menu.Item>
          )
        )}
      </Menu>
    );
  }
}
