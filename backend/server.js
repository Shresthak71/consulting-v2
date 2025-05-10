const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")
require("dotenv").config()

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware")

// Import routes
const authRoutes = require("./routes/authRoutes")
const branchRoutes = require("./routes/branchRoutes")
const studentRoutes = require("./routes/studentRoutes")
const applicationRoutes = require("./routes/applicationRoutes")
const documentRoutes = require("./routes/documentRoutes")
const checklistRoutes = require("./routes/checklistRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const userRoutes = require("./routes/userRoutes")

const app = express()
const server = http.createServer(app)

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for document uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/checklists", checklistRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/users", userRoutes)

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  // Join branch room for branch-specific messages
  socket.on("join-branch", (branchId) => {
    socket.join(`branch-${branchId}`)
    console.log(`User joined branch-${branchId}`)
  })

  // Handle inter-branch messaging
  socket.on("branch-message", (data) => {
    io.to(`branch-${data.targetBranchId}`).emit("new-message", {
      from: data.fromBranchId,
      fromName: data.fromBranchName,
      message: data.message,
      timestamp: new Date(),
    })
  })

  // Handle document notifications
  socket.on("document-update", (data) => {
    io.to(`branch-${data.branchId}`).emit("document-notification", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
