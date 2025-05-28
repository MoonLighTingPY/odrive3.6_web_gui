import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

import configSlice from './slices/configSlice'
import deviceSlice from './slices/deviceSlice'
import uiSlice from './slices/uiSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['config'] // Only persist config, not device state
}

const rootReducer = combineReducers({
  config: configSlice,
  device: deviceSlice,
  ui: uiSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)