import { io } from "socket.io-client"

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"

let socket

export const initSocket = (user) => {
  if (!socket) {
    socket = io(SOCKET_URL)

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)

      // Join branch room if user has a branch
      if (user?.branch?.id) {
        socket.emit("join-branch", user.branch.id)
      }
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })
  }

  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.")
  }
  return socket
}

export const closeSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
