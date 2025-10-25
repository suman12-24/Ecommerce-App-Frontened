import {configureStore, combineReducers} from '@reduxjs/toolkit'; // ✅ Fix here
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import wishListReducer from './wishListSlice';
import languageReducer from './languageSlice';
import firstLaunchReducer from './firstLaunchSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart', 'wishList', 'language', 'firstLaunch'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishList: wishListReducer,
  language: languageReducer,
  firstLaunch: firstLaunchReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
