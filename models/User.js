const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    empId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Employee", "MD/CEO"] }, // <-- Added MD/CEO
    department: { type: String, required: true },
    designation: { type: String, required: true },
    status: { type: String, default: "Absent" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);