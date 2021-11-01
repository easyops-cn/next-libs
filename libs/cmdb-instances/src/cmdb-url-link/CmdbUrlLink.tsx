import React from "react";

interface CmdbUrlLinkProps {
  linkStr: string;
}

export const checkUrl = (urlStr: string) => {
  const patternSchema = /^[a-zA-Z]+:\/\/.*$/;
  const preSlashPatty = /^\//;
  if (urlStr) {
    return patternSchema.test(urlStr) || preSlashPatty.test(urlStr)
      ? urlStr
      : "http://" + urlStr;
  }
  return "";
};
export const generateUrlLink = (linkStr: string) => {
  const patty = /^\[(.*)\]\((.*)\)$/;
  const arr = linkStr.match(patty);
  if (linkStr.match(patty)) {
    return {
      url: checkUrl(arr[2]),
      title: arr[1] || arr[2],
    };
  } else {
    const link = checkUrl(linkStr);
    return {
      url: link,
      title: link,
    };
  }
};
export function CmdbUrlLink(props: CmdbUrlLinkProps): React.ReactElement {
  const collection = props.linkStr && generateUrlLink(props.linkStr);
  return props.linkStr ? (
    <span>
      <a href={collection.url} target="_blank" rel="noopener noreferrer">
        {collection.title}
      </a>
    </span>
  ) : null;
}
