const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // We use String here to match your custom 'EMP12345' IDs!
    employeeId: { type: String, required: true, index: true },
    
    // ISO Date string (YYYY-MM-DD) for perfect filtering
    date: { type: String, required: true }, 
    
    checkIn: { type: String },
    checkOut: { type: String },
    
    status: { type: String, required: true, default: "Absent" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);