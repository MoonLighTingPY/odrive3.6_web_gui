import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage
import deviceReducer from './slices/deviceSlice'
import configReducer from './slices/configSlice'
import uiReducer from './slices/uiSlice'
import telemetryReducer from './slices/telemetrySlice'

const rootReducer = combineReducers({
  device: deviceReducer,
  config: configReducer,
  ui: uiReducer,
  telemetry: telemetryReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['device', 'config'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // for redux-persist
    }),
})

export const persistor = persistStore(store)
export default store