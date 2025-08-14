import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios.js";
import toast from "react-hot-toast";
import { connectWebSocket, disconnectWebSocket } from "../../lib/socketClient.js";

const initialState = {
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  onlineUsers: [],
};

// Async thunks
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/api/auth/check");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Auth check failed");
  }
});

export const signup = createAsyncThunk("auth/signup", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/api/auth/signup", data);
    toast.success("Account created successfully");
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Signup failed");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/api/auth/login", data);
    toast.success("Logged in successfully");
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Login failed");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.post("/api/auth/logout");
    toast.success("Logged out successfully");
    return null;
  } catch (err) {
    toast.error(err.response?.data?.message || "Logout failed");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const connectSocket = () => (dispatch, getState) => {
  const userId = getState().auth.authUser?._id;
  if (!userId) return;

  connectWebSocket(userId, (message) => {
    if (message.type === "onlineUsers") {
      dispatch(setOnlineUsers(message.payload));
    }
  });
};

export const disconnectSocketThunk = () => () => {
  disconnectWebSocket();
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      })
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isSigningUp = false;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
        state.onlineUsers = [];
      });
  },
});

export const { setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
