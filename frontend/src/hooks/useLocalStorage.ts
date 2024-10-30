import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useLocalStorage = <T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>, () => void] => {
  const prefixedKey = `amp_${key}`;
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(prefixedKey);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (e) {
        console.error(`Error parsing localStorage key "${prefixedKey}":`, e);
        localStorage.removeItem(prefixedKey);
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [prefixedKey, value]);

  const removeItem = () => {
    localStorage.removeItem(prefixedKey);
  };

  return [value, setValue, removeItem];
};
