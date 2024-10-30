import { useLocalStorage } from '@/hooks/useLocalStorage.ts';
import { generateId } from '@/utils';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const useConversationId = () => {
  const [conversationExpirationDateInMs, setConversationExpirationDateInMs] = useLocalStorage(
    'conversation_expiration',
    Date.now() + ONE_DAY_IN_MS,
  );
  const [conversationId, setConversationId] = useLocalStorage('conversation_id', generateId());

  const updateConversationId = (): void => {
    setConversationId(generateId());
    setConversationExpirationDateInMs(Date.now() + ONE_DAY_IN_MS);
  };

  const isConversationIdExpired = (): boolean => {
    return Date.now() > conversationExpirationDateInMs;
  };

  return { conversationId, updateConversationId, isConversationIdExpired };
};
