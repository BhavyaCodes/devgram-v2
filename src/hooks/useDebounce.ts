import { useEffect, useState } from 'react';

export const useDebounce = <T>(input: T, ms: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(input);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(input);
    }, ms);

    return () => clearTimeout(timeout);
  }, [input, ms]);

  return debouncedValue;
};
