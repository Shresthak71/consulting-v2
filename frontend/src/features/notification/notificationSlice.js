import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import notificationService from "./notificationService"

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
}

// Get user notifications
export const getUserNotifications = createAsyncThunk("notification/getUserNotifications", async (_, thunkAPI) => {
  try {
    return await notificationService.getUserNotifications()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Mark notification as read
export const markAsRead = createAsyncThunk("notification/markAsRead", async (notificationId, thunkAPI) => {
  try {
    return await notificationService.markAsRead(notificationId)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Send expiry reminders (admin only)
export const sendExpiryReminders = createAsyncThunk("notification/sendExpiryReminders", async (_, thunkAPI) => {
  try {
    return await notificationService.sendExpiryReminders()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserNotifications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
        state.notifications = state.notifications.map((notification) =>
          notification.notification_id === action.meta.arg ? { ...notification, is_read: true } : notification,
        )
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(sendExpiryReminders.pending, (state) => {
        state.isLoading = true
      })
      .addCase(sendExpiryReminders.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(sendExpiryReminders.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = notificationSlice.actions
export default notificationSlice.reducer
