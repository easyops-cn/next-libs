import React, { useEffect } from "react";
import { getHistory } from "@next-core/brick-kit";

export const useConfirmToLeave = (
  shouldBlockRef: React.MutableRefObject<boolean>,
  message = "确定离开该页面?"
): void => {
  let historyUnblock: any;

  const beforeunload = (e: BeforeUnloadEvent) => {
    if (shouldBlockRef.current) {
      e.preventDefault();
      e.returnValue = message;
      return message;
    } else {
      delete e.returnValue;
    }
  };

  useEffect(() => {
    const history = getHistory();
    historyUnblock = history.block(() => {
      if (shouldBlockRef.current) {
        return message;
      }
    });

    window.addEventListener("beforeunload", beforeunload);

    return () => {
      historyUnblock();
      window.removeEventListener("beforeunload", beforeunload);
    };
  }, []);
};
