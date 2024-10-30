import { useLocalStorage } from '@/hooks/useLocalStorage.ts';
import { generateId } from '@/utils';

export const useUserId = () => {
  const [userId, setUserId] = useLocalStorage('user_id', generateId());

  return { userId, setUserId };
};
