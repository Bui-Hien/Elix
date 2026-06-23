import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import designerReducer from './slices/designerSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        designer: designerReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
