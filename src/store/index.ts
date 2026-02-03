import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import symptomReducer from './slices/symptomSlice';
import providerReducer from './slices/providerSlice';
import appointmentReducer from './slices/appointmentSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    symptom: symptomReducer,
    provider: providerReducer,
    appointment: appointmentReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/register/fulfilled'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['auth.someNonSerializableField'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;