import { useCallback, useEffect, useRef, useState } from "react";
import {
  HttpFetchError,
  HttpParseError,
  HttpResponseError
} from "@easyops/brick-http";
import { handleHttpError } from "@easyops/brick-kit";
import { get } from "lodash";

type ThenArg<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any[]) => Promise<infer U>
  ? U
  : T;

export type HttpError =
  | Error
  | HttpFetchError
  | HttpResponseError
  | HttpParseError;

export interface HttpOptions<T> {
  onError?: (err: HttpError) => any;
  // Default to false.
  catchError?: boolean;
  onSuccess?: (data: T) => any;
  onFinally?: () => any;
  // Gets the value at path of data.
  getter?: {
    // The path of the property to get.
    path: string | string[];
    // The value returned for undefined resolved values.
    defaultValue?: any;
  };
}

export function useHttp<T, U extends any[], V>(
  fn: (...args: U) => V,
  args: U,
  options?: HttpOptions<V>
): {
  reload: (params?: U) => void;
  loading: boolean;
  data: ThenArg<typeof fn>;
  error: HttpError;
} {
  const isMounted = useRef<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<HttpError>(null);
  const [data, setData] = useState(null);
  const argsRef = useRef<U>();

  const fetchData = useCallback(async (): Promise<void> => {
    const { onError, onSuccess, catchError = false, getter, onFinally } =
      options || {};

    try {
      setLoading(true);

      let response = await fn(...argsRef.current);

      if (getter) {
        const { path, defaultValue } = getter;
        response = get(response, path, defaultValue || null);
      }

      isMounted.current && setData(response);
      onSuccess && onSuccess(response);
    } catch (e) {
      isMounted.current && setError(e);
      catchError && handleHttpError(e);
      onError && onError(e);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }

      onFinally && onFinally();
    }
  }, [fn, options]);

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
