const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")
require("dotenv").config()

// Add this near the top with other imports
const { initScheduler } = require("./utils/scheduler")

// Import routes
const authRoutes = require("./routes/authRoutes")
const branchRoutes = require("./routes/branchRoutes")
const studentRoutes = require("./routes/studentRoutes")
const applicationRoutes = require("./routes/applicationRoutes")
const documentRoutes = require("./routes/documentRoutes")
const checklistRoutes = require("./routes/checklistRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const bulkRoutes = require("./routes/bulkRoutes")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  socket.on("join_branch", (branchId) => {
    socket.join(`branch_${branchId}`)
    console.log(`User joined branch_${branchId}`)
  })

  socket.on("send_message", (data) => {
    io.to(`branch_${data.branchId}`).emit("receive_message", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/checklists", checklistRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/bulk", bulkRoutes)

// Add this after setting up routes but before starting the server
if (process.env.ENABLE_SCHEDULER === "true") {
  initScheduler()
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
