import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { connectWebSocket, disconnectWebSocket } from "../../lib/socketClient";

const initialState = {
  users: [],
  messages: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
};

export const getUsers = createAsyncThunk("chat/getUsers", async (_, { rejectWithValue }) =>{
  try {
    const res = await axiosInstance.get("/api/message/users");
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to fetch users");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const getMessages = createAsyncThunk("chat/getMessages", async (userId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/api/message/${userId}`);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to fetch messages");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const sendMessage = createAsyncThunk("chat/sendMessage", async (messageData, { getState, rejectWithValue }) => {
  try {
    const { selectedUser } = getState().chat;
    const res = await axiosInstance.post(`/api/message/send/${selectedUser._id}`, messageData);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send message");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const subscribeToMessages = createAsyncThunk(
  "chat/subscribeToMessages",
  async (_, { dispatch, getState }) => {
    const { authUser } = getState().auth;

    connectWebSocket(authUser._id, (message) => {
      const { selectedUser } = getState().chat;
      
      if (
        selectedUser &&
        (message.senderId === selectedUser._id ||
         message.receiverId === selectedUser._id)
      ) {
        dispatch(appendMessage(message));
      } else {
        // Optionally handle notifications for other chats
        console.log("Message for another conversation", message);
      }
    });
  }
);



export const unsubscribeFromMessages = createAsyncThunk(
  "chat/unsubscribeFromMessages",
  async () => {
    disconnectWebSocket();
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];
    },

    appendMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getUsers.rejected, (state) => {
        state.isUsersLoading = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.isMessagesLoading = false;
      })
      .addCase(getMessages.rejected, (state) => {
        state.isMessagesLoading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { setSelectedUser, appendMessage } = chatSlice.actions;
export default chatSlice.reducer;
