const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: String,
  employeeName: String,
  department: String,
  reason: String,
  status: { type: String, default: "Pending" },
  date: String
});

module.exports = mongoose.model("Leave", leaveSchema);