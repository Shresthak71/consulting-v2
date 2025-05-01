import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import io from "socket.io-client"

let socket

const initialState = {
  messages: [],
  isConnected: false,
  currentBranchId: null,
}

// Connect to socket
export const connectSocket = createAsyncThunk("message/connect", async (_, { getState }) => {
  const { auth } = getState()
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"

  socket = io(SOCKET_URL)

  return new Promise((resolve) => {
    socket.on("connect", () => {
      console.log("Socket connected")

      // Join branch room if user has a branch
      if (auth.user && auth.user.branchId) {
        socket.emit("join_branch", auth.user.branchId)
      }

      resolve(true)
    })
  })
})

// Join branch room
export const joinBranch = createAsyncThunk("message/joinBranch", async (branchId, { getState }) => {
  if (socket && socket.connected) {
    socket.emit("join_branch", branchId)
    return branchId
  }
  return null
})

// Send message
export const sendMessage = createAsyncThunk("message/send", async (messageData, { getState }) => {
  const { auth } = getState()

  if (socket && socket.connected) {
    const message = {
      ...messageData,
      sender: auth.user.fullName,
      senderId: auth.user.id,
      timestamp: new Date().toISOString(),
    }

    socket.emit("send_message", message)
    return message
  }
  return null
})

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    receiveMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    clearMessages: (state) => {
      state.messages = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.fulfilled, (state) => {
        state.isConnected = true
      })
      .addCase(joinBranch.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentBranchId = action.payload
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (action.payload) {
          state.messages.push(action.payload)
        }
      })
  },
})

export const { receiveMessage, clearMessages } = messageSlice.actions
export default messageSlice.reducer

// Socket middleware
export const socketMiddleware = (store) => (next) => (action) => {
  if (action.type === "message/connect/fulfilled" && socket) {
    socket.on("receive_message", (message) => {
      store.dispatch(receiveMessage(message))
    })
  }

  return next(action)
}
