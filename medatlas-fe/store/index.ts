import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth','timesheets'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).prepend(listenerMiddleware.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
