import React from 'react';
import { store } from '@/store.ts';
import { Provider } from 'react-redux';
import { AppContent } from '@/AppContent.tsx';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
