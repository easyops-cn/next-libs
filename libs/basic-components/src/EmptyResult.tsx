import React from "react";
import { useCurrentTheme } from "@next-core/brick-kit";
import { EmptyResultStatus } from "./EmptyResultStatus";

import { ReactComponent as BrowserTooOldSvg } from "./empty-result/browser-too-old.svg";
import { ReactComponent as NoDataSvg } from "./empty-result/no-data.svg";
import { ReactComponent as NoHistoryVersionSvg } from "./empty-result/no-history-version.svg";
import { ReactComponent as NoVisitRecordSvg } from "./empty-result/no-visit-record.svg";
import { ReactComponent as SearchEmptySvg } from "./empty-result/search-empty.svg";
import { ReactComponent as WelcomeToCreateSvg } from "./empty-result/welcome-to-create.svg";

import { ReactComponent as BrowserTooOldDarkSvg } from "./empty-result/browser-too-old-dark.svg";
import { ReactComponent as NoDataDarkSvg } from "./empty-result/no-data-dark.svg";
import { ReactComponent as NoHistoryVersionDarkSvg } from "./empty-result/no-history-version-dark.svg";
import { ReactComponent as NoVisitRecordDarkSvg } from "./empty-result/no-visit-record-dark.svg";
import { ReactComponent as SearchEmptyDarkSvg } from "./empty-result/search-empty-dark.svg";
import { ReactComponent as WelcomeToCreateDarkSvg } from "./empty-result/welcome-to-create-dark.svg";

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
  [EmptyResultStatus.WelcomeToCreate]: <WelcomeToCreateSvg />,
};

// 暗色主题图标
const darkMap: { [key in EmptyResultStatus]: React.ReactElement } = {
  [EmptyResultStatus.BrowserTooOld]: <BrowserTooOldDarkSvg />,
  [EmptyResultStatus.NoData]: <NoDataDarkSvg />,
  [EmptyResultStatus.Empty]: <NoDataDarkSvg />,
  [EmptyResultStatus.NoHistoryVersion]: <NoHistoryVersionDarkSvg />,
  [EmptyResultStatus.NoVisitRecord]: <NoVisitRecordDarkSvg />,
  [EmptyResultStatus.SearchEmpty]: <SearchEmptyDarkSvg />,
  [EmptyResultStatus.WelcomeToCreate]: <WelcomeToCreateDarkSvg />,
};

export function EmptyResult(props: EmptyResultProps): React.ReactElement {
  const theme = useCurrentTheme();
  const isDark = theme === "dark-v2";
  return isDark ? darkMap[props.status] : map[props.status];
}
