import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import uiReducer from './slices/uiSlice'
import deviceReducer from './slices/deviceSlice'
import configReducer from './slices/configSlice'

const rootReducer = combineReducers({
  ui: uiReducer,
  device: deviceReducer,
  config: configReducer,
})

const persistConfig = {
  key: 'odrive_gui_v056',
  storage,
  whitelist: ['ui', 'config'], // Don't persist device state
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)