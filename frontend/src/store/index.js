import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

import configSlice from './slices/configSlice'
import deviceSlice from './slices/deviceSlice'
import uiSlice from './slices/uiSlice'
import telemetrySlice from './slices/telemetrySlice' // Add this

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['config'] // Only persist config, not device state or telemetry
}

const rootReducer = combineReducers({
  config: configSlice,
  device: deviceSlice,
  ui: uiSlice,
  telemetry: telemetrySlice, // Add this
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