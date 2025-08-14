import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthStore/AuthSlice.js";
import chatReducer from "./AuthStore/ChatSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat:chatReducer
  },
});
