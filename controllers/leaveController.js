const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");

const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find();
    const formatted = leaves.map(l => ({
      id: l.id, employeeId: l.employeeId, employeeName: l.employeeName, department: l.department, reason: l.reason, status: l.status, date: l.date
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLeave = async (req, res) => {
  try {
    const newLeave = await Leave.create({
      id: `LV${Date.now()}`, employeeId: req.body.employeeId, employeeName: req.body.employeeName, department: req.body.department, reason: req.body.reason, date: req.body.date, status: "Pending"
    });

    const leaveData = { id: newLeave.id, employeeId: newLeave.employeeId, employeeName: newLeave.employeeName, department: newLeave.department, reason: newLeave.reason, status: newLeave.status, date: newLeave.date };
    const io = req.app.get("io");
    io.emit("newLeaveRequest", leaveData);

    res.status(201).json(leaveData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const updatedLeave = await Leave.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });

    if (req.body.status === "Accepted") {
      // Force PTO record directly into the Attendance collection
      await Attendance.findOneAndUpdate(
        { employeeId: updatedLeave.employeeId, date: updatedLeave.date },
        { checkIn: "Approved PTO", checkOut: "Approved PTO", status: "On Leave" },
        { upsert: true, new: true }
      );
    }

    const io = req.app.get("io");
    io.emit("leaveStatusUpdated", updatedLeave);
    res.status(200).json({ success: true, leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaves, createLeave, updateLeaveStatus };