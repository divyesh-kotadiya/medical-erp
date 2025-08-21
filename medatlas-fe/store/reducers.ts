import { combineReducers } from "@reduxjs/toolkit";
import authReducer from './slices/auth';
import inviteReducer from './slices/invite';

export const rootReducer = combineReducers({
  auth: authReducer,
  invite : inviteReducer,
});