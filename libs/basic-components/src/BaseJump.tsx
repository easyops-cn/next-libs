import React from "react";
import { Input, Icon } from "antd";
import { withTranslation, WithTranslation } from "react-i18next";
import { Link } from "./Link";
import style from "./BaseJump.module.css";
import { Subject } from "rxjs/internal/Subject";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { getInstanceShowName } from "@libs/cmdb-utils";
interface BaseJumpProps extends WithTranslation {
  isBackendSearch?: boolean;
  instanceList?: [];
  modelDefine?: {};

  fetchData: any;
  title: string;
  nameKey: string;
}
interface BaseJumpState {
  _show: boolean;
  showList: any[];
  inputVal: string;
  cacheList: any[];
  instanceName?: string;
}
interface InstanceItem {
  instanceId: string;
  name?: string;
  [key: string]: string;
}
export class LegacyBaseJump extends React.Component<
  BaseJumpProps,
  BaseJumpState
> {
  searchTerm$: Subject<string>;
  wrapperRef: any;
  constructor(props: any, context: any) {
    super(props, context);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.searchTerm$ = new Subject<string>();
    this.state = {
      _show: false,
      showList: [],
      inputVal: "",
      cacheList: [] //缓存一开始空值搜索的列表
    };
  }
  renderList(list: InstanceItem[] = [], nameKey: string) {
    const showList = list.map(item => {
      return (
        <li key={item.instanceId}>
          <Link to={item.instanceId}>
            {getInstanceShowName(item, [nameKey])}
          </Link>
        </li>
      );
    });
    return showList;
  }
  async componentDidMount() {
    // @ts-ignore
    document.addEventListener("click", this.handleClickOutside);
    await this.searchTerm$
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(res => {
        this.fetchInstanceList(res);
      });
  }
  componentWillUnmount() {
    // @ts-ignore
    document.removeEventListener("click", this.handleClickOutside);
  }
  async fetchInstanceList(query: string) {
    const q = (query || "").toLowerCase();
    if (q === "" || q == null) {
      this.setState({
        showList: this.state.cacheList
      });
      return;
    }
    const list = await this.props.fetchData(q);
    this.setState({
      showList: list
    });
  }
  async toggleElementState() {
    this.setState(prevState => ({
      _show: !prevState._show
    }));
    if (!this.state.cacheList.length) {
      const cacheList = await this.props.fetchData("");
      this.setState({
        showList: cacheList,
        cacheList
      });
    }
  }
  setWrapperRef(node: any) {
    this.wrapperRef = node;
  }
  handleClickOutside(event: React.ChangeEvent<HTMLInputElement>) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({
        _show: false
      });
    }
    return;
  }
  handleSearchInstance(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      inputVal: event.target.value
    });
    this.searchTerm$.next(event.target.value);
  }
  render(): React.ReactNode {
    const { _show, showList, inputVal, instanceName } = this.state;
    const { nameKey } = this.props;

    return (
      <div style={{ position: "relative" }} ref={this.setWrapperRef}>
        <div
          onClick={this.toggleElementState.bind(this)}
          className={style.customTitleContainer}
        >
          <span className={style.customTitle}>{this.props.title}</span>
          <span
            style={{ marginLeft: "5px", marginTop: "5px", fontSize: "4px" }}
          >
            <Icon type={_show ? "caret-up" : "caret-down"} />
          </span>
        </div>
        <div className={(_show ? "" : style.hidden) + " " + style.gridCard}>
          <div className={style.searchBoxHeading}>
            <div className={style.searchBar}>
              <Input
                value={inputVal}
                onChange={this.handleSearchInstance.bind(this)}
                suffix={<Icon type="search" />}
              />
            </div>
          </div>
          <div className={style.searchContainer}>
            {showList.length > 0 ? (
              <ul className={style.searchList}>
                {this.renderList(showList, this.props.nameKey)}
              </ul>
            ) : (
              <span className={style.zeroSearchResult}>查询结果为空</span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export const BaseJump = withTranslation("BaseJump")(LegacyBaseJump);
