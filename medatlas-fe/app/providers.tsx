'use client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '@/store';
import { SnackbarProvider } from 'notistack';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {children}
        </SnackbarProvider>
      </PersistGate>
    </Provider>
  );
}
