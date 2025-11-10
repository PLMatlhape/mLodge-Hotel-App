import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomsReducer from './slices/roomsSlice';
import bookingsReducer from './slices/bookingsSlice';
import paymentReducer from './slices/paymentSlice';
import reviewsReducer from './slices/reviewsSlice';
import staffReducer from './slices/staffSlice';
import promoCodesReducer from './slices/promoCodesSlice';
import refundsReducer from './slices/refundsSlice';
import analyticsReducer from './slices/analyticsSlice';
import inquiriesReducer from './slices/inquiriesSlice';
import emailTemplatesReducer from './slices/emailTemplatesSlice';
import auditLogsReducer from './slices/auditLogsSlice';
import reportsReducer from './slices/reportsSlice';
import favouritesReducer from './slices/favouritesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    bookings: bookingsReducer,
    payment: paymentReducer,
    reviews: reviewsReducer,
    staff: staffReducer,
    promoCodes: promoCodesReducer,
    refunds: refundsReducer,
    analytics: analyticsReducer,
    inquiries: inquiriesReducer,
    emailTemplates: emailTemplatesReducer,
    auditLogs: auditLogsReducer,
    reports: reportsReducer,
    favourites: favouritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
