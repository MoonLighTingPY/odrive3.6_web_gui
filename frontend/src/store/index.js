import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage
import deviceReducer from './slices/deviceSlice'
import uiReducer from './slices/uiSlice'
import telemetryReducer from './slices/telemetrySlice'
import liveReducer from './slices/liveSlice'

const rootReducer = combineReducers({
  device: deviceReducer,
  ui: uiReducer,
  telemetry: telemetryReducer,
  live: liveReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['device'],
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