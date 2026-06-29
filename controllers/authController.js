const User = require("../models/User");
const Attendance = require("../models/Attendance");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, secretCode } = req.body;
    let { department, designation } = req.body;

    // --- SECURE ROLE VALIDATION ---
    if (role === "MD/CEO") {
      if (secretCode !== "EDVAC-CEO-2026") return res.status(400).json({ success: false, message: "Invalid Executive Access Code." });
      department = "Executive";
      designation = "MD/CEO";
    } else if (role === "Admin") {
      if (secretCode !== "EDVAC-MASTER-ADMIN") return res.status(400).json({ success: false, message: "Invalid Master Admin Key." });
    } else if (role === "Employee") {
      if (secretCode !== "EDVAC-EMP-2026") return res.status(400).json({ success: false, message: "Invalid Employee Access Code." });
    } else {
      return res.status(400).json({ success: false, message: "Invalid Role Selected." });
    }
    // ------------------------------

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists with this email." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const empId = `EMP${Date.now()}`;

    await User.create({ empId, name, email, phone, password: hashedPassword, role, department, designation, status: "Absent" });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ success: false, message: "Invalid Credentials. Have you registered?" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid Credentials. Incorrect Password." });

    const token = jwt.sign({ id: user.empId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const userAttendance = await Attendance.find({ employeeId: user.empId });

    res.status(200).json({
      success: true, token,
      user: {
        id: user.empId, name: user.name, email: user.email, phone: user.phone, role: user.role, department: user.department, designation: user.designation, status: user.status, createdAt: user.createdAt,
        attendance: userAttendance.map(a => ({ date: a.date, checkIn: a.checkIn, checkOut: a.checkOut, status: a.status }))
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser };