import React from "react";
import BrowserTooOldSvg from "./empty-result/browser-too-old.svg";
import NoDataSvg from "./empty-result/no-data.svg";
import NoHistoryVersionSvg from "./empty-result/no-history-version.svg";
import NoVisitRecordSvg from "./empty-result/no-visit-record.svg";
import SearchEmptySvg from "./empty-result/search-empty.svg";
import WelcomeToCreateSvg from "./empty-result/welcome-to-create.svg";

export enum EmptyResultStatus {
  BrowserTooOld = "browser-too-old",
  Empty = "empty",
  NoData = "no-data",
  NoHistoryVersion = "no-history-version",
  NoVisitRecord = "no-visit-record",
  SearchEmpty = "search-empty",
  WelcomeToCreate = "welcome-to-create"
}

interface EmptyResultProps {
  status: EmptyResultStatus;
}

const map: { [key in EmptyResultStatus]: React.ReactElement } = {
  [EmptyResultStatus.BrowserTooOld]: <BrowserTooOldSvg />,
  [EmptyResultStatus.NoData]: <NoDataSvg />,
  [EmptyResultStatus.Empty]: <NoDataSvg />,
  [EmptyResultStatus.NoHistoryVersion]: <NoHistoryVersionSvg />,
  [EmptyResultStatus.NoVisitRecord]: <NoVisitRecordSvg />,
  [EmptyResultStatus.SearchEmpty]: <SearchEmptySvg />,
  [EmptyResultStatus.WelcomeToCreate]: <WelcomeToCreateSvg />
};

export function EmptyResult(props: EmptyResultProps): React.ReactElement {
  return map[props.status];
}
