import { setView } from '@/views/viewsSlice.ts';
import { useAppDispatch } from '@/hooks/useStore.ts';
import { TView } from '@/views/types.ts';

export const useChatView = () => {
  const dispatch = useAppDispatch();

  return () => dispatch(setView('chat'));
};

export const useVoiceView = () => {
  const dispatch = useAppDispatch();

  return () => dispatch(setView('voice'));
};

export const useView = () => {
  const dispatch = useAppDispatch();

  return (view: TView) => dispatch(setView(view));
};
