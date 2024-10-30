import { useLocalStorage } from '@/hooks/useLocalStorage.ts';
import { useEffect } from 'react';

const defaultClientId = import.meta.env.VITE_CLIENT_ID ?? '';

export const useClient = (onNewClientInit?: () => void, onSameClientInit?: () => void) => {
  const [clientId, setClientId, removeClientId] = useLocalStorage<string>('client_id', defaultClientId);

  const resetClientId = () => {
    removeClientId();
    setClientId(defaultClientId);
  };

  useEffect(() => {
    if (clientId !== defaultClientId) {
      setClientId(defaultClientId);
      if (onNewClientInit) {
        onNewClientInit();
      }
    } else {
      if (onSameClientInit) {
        onSameClientInit();
      }
    }
  }, []);

  return {
    clientId,
    setClientId,
    resetClientId,
  };
};
