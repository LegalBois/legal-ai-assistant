import React, { useEffect } from 'react';
import Hotjar from '@hotjar/browser';
import { useAppSelector } from '@/hooks/useStore.ts';
import { selectCurrentView } from '@/views/viewsSlice.ts';
import { ChatView, TView, VoiceView } from '@/views';
import { useView } from '@/views/useViews.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';
import { useLocalStorage } from '@/hooks';
import LawyersLandingPage from "@/views/LandingPage.tsx";

export const AppContent: React.FC = () => {
  const currentView = useAppSelector(selectCurrentView);
  const goToView = useView();
  const [storedView, setStoredView] = useLocalStorage<TView>('currentView', 'chat');

  useEffect(() => {
    const siteId = 5093387;
    const hotjarVersion = 6;

    Hotjar.init(siteId, hotjarVersion);
  }, []);

  useEffect(() => {
    if (storedView && storedView !== currentView) {
      goToView(storedView);
    }
  }, []);

  useEffect(() => {
    if (currentView && currentView !== storedView) {
      setStoredView(currentView);
    }
  }, [currentView, setStoredView]);

  let content;
  switch (currentView) {
    case 'chat':
      content = <ChatView key="chat" />;
      break;
    case 'voice':
      content = <VoiceView key="voice" />;
      break;
    default:
      content = <ChatView key="chat" />;
      break;
  }

  return (
    <div className="flex h-full max-w-full overflow-hidden bg-blue-900">
      <div className="left-side-content w-3/4 bg-gray-200 p-4">
        <LawyersLandingPage />
      </div>
      <div className="right-side-content flex-grow grid">
        {content}
        <div className="absolute top-12 w-full">
          <Toaster />
        </div>
      </div>
    </div>
  );
};