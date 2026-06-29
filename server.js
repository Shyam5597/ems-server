require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// Import Controllers & Middleware
const authRoutes = require("./routes/authRoutes"); 
const protect = require("./middleware/authMiddleware");

const { getUsers, updateUser, deleteUser } = require("./controllers/userController");
const { getDepartments, createDepartment, deleteDepartment } = require("./controllers/departmentController");
const { getLeaves, createLeave, updateLeaveStatus } = require("./controllers/leaveController");

// Connect to MongoDB
connectDB();

const app = express();

// Define allowed origins for both CORS and Socket.io
const allowedOrigins = [
  "http://localhost:5173", 
  "https://ems-client-six.vercel.app" // Add your Vercel URL here
];

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User connected to real-time socket: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
// -----------------------

// Middleware
// Update CORS middleware to use the allowedOrigins list
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);

// Protected API Routes
app.get("/api/users", protect, getUsers);
app.put("/api/users/:id", protect, updateUser);
app.delete("/api/users/:id", protect, deleteUser);

app.get("/api/departments", protect, getDepartments);
app.post("/api/departments", protect, createDepartment);
app.delete("/api/departments/:id", protect, deleteDepartment);

app.get("/api/leaves", protect, getLeaves);
app.post("/api/leaves", protect, createLeave);
app.put("/api/leaves/:id", protect, updateLeaveStatus);

// Base Route
app.get("/", (req, res) => {
  res.send("Employee Management API Running with WebSockets");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});