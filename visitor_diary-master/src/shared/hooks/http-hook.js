import { useState, useCallback , useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  // const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      // const httpabortctrl = new AbortController();
      // activeHttpRequests.current.push(httpabortctrl);
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          // signal: httpabortctrl.signal,
        });
        const responseData = await response.json();
        // activeHttpRequests.current = activeHttpRequests.current.filter(
          // (reqctrl) => reqctrl !== httpabortctrl
        // );
        if (!response.ok) {
          console.log(responseData)
          throw new Error(responseData.message);
        }
        setIsLoading(false);
        return responseData;
      } catch (err) {
          setError(err.message);
          setIsLoading(false);
          throw err;
      }
    },
    []
  );
  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      // activeHttpRequests.current.forEach((abortctrl) => abortctrl.abort());
    };
  }, []);
  return { isLoading, error, sendRequest, clearError };
};
