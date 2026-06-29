require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http"); // <-- Needed for Socket.io
const { Server } = require("socket.io"); // <-- Needed for Socket.io

// Import Controllers & Middleware
const authRoutes = require("./routes/authRoutes"); 
const protect = require("./middleware/authMiddleware");

const { getUsers, updateUser, deleteUser } = require("./controllers/userController");
const { getDepartments, createDepartment, deleteDepartment } = require("./controllers/departmentController");
const { getLeaves, createLeave, updateLeaveStatus } = require("./controllers/leaveController");

// Connect to MongoDB
connectDB();

const app = express();

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React App URL
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make 'io' globally accessible to all controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User connected to real-time socket: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
// -----------------------

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);

// Users (Employees) API - Protected
app.get("/api/users", protect, getUsers);
app.put("/api/users/:id", protect, updateUser);
app.delete("/api/users/:id", protect, deleteUser);

// Departments API - Protected
app.get("/api/departments", protect, getDepartments);
app.post("/api/departments", protect, createDepartment);
app.delete("/api/departments/:id", protect, deleteDepartment);

// Leaves API - Protected
app.get("/api/leaves", protect, getLeaves);
app.post("/api/leaves", protect, createLeave);
app.put("/api/leaves/:id", protect, updateLeaveStatus);

// Base Route
app.get("/", (req, res) => {
  res.send("Employee Management API Running with WebSockets");
});

const PORT = process.env.PORT || 5000;

// CRITICAL: We must listen on 'server', not 'app' now!
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});