import { useCallback, useEffect, useRef, useState } from "react";
import {
  HttpFetchError,
  HttpParseError,
  HttpResponseError
} from "@easyops/brick-http";

type ThenArg<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any[]) => Promise<infer U>
  ? U
  : T;

export function useHttp<T, U extends any[], V>(
  fn: (...args: U) => V,
  args: U
): {
  reload: (params?: U) => void;
  loading: boolean;
  data: ThenArg<typeof fn>;
  error: Error | HttpFetchError | HttpResponseError | HttpParseError;
} {
  const isMounted = useRef<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const argsRef = useRef<U>();

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const response = await fn(...argsRef.current);
      isMounted.current && setData(response);
    } catch (e) {
      isMounted.current && setError(e);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fn]);

  const reload = async (args?: U): Promise<void> => {
    if (args) {
      argsRef.current = args;
    }
    await fetchData();
  };

  useEffect(() => {
    isMounted.current = true;
    if (!argsRef.current) {
      argsRef.current = args;

      (async () => {
        await fetchData();
      })();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchData, args]);

  return { error, loading, data, reload };
}
