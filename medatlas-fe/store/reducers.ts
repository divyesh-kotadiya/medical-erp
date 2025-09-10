import { combineReducers } from "@reduxjs/toolkit";
import authReducer from './slices/auth';
import inviteReducer from './slices/invite';
import shiftReducer from './slices/shifts';
import timesheetsReducer from './slices/timesheets';

export const rootReducer = combineReducers({
  auth: authReducer,
  invite : inviteReducer,
  shifts: shiftReducer,
  timesheets: timesheetsReducer,
});