import { useEffect, useState } from 'react';

type VersionInfo = {
  uiVersion: string;
  apiVersion: string | null;
};

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:80';

export const useVersion = (): VersionInfo => {
  const [apiVersion, setApiVersion] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiVersion = async () => {
      try {
        const response = await fetch(`${API_HOST}/openapi.json`);
        const data = await response.json();
        setApiVersion(data.info.version);
      } catch (error) {
        console.error('Failed to fetch API version:', error);
        setApiVersion('unknown');
      }
    };

    fetchApiVersion();
  }, []);

  const uiVersion = import.meta.env.VITE_APP_VERSION || 'unknown';

  return { uiVersion, apiVersion };
};
