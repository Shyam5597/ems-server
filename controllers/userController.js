const User = require("../models/User");
const Attendance = require("../models/Attendance");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    const allAttendance = await Attendance.find();

    const formattedUsers = users.map(u => {
      const userAttendance = allAttendance
        .filter(a => a.employeeId === u.empId)
        .map(a => ({ date: a.date, checkIn: a.checkIn, checkOut: a.checkOut, status: a.status }));

      return {
        id: u.empId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        department: u.department,
        designation: u.designation,
        status: u.status,
        createdAt: u.createdAt,
        attendance: userAttendance
      };
    });
    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.attendance) {
      for (let record of updateData.attendance) {
        await Attendance.findOneAndUpdate(
          { employeeId: id, date: record.date },
          { checkIn: record.checkIn, checkOut: record.checkOut, status: record.status },
          { upsert: true, new: true }
        );
      }
      delete updateData.attendance;
    }

    const updatedUser = await User.findOneAndUpdate({ empId: id }, updateData, { new: true });
    const userAttendance = await Attendance.find({ employeeId: id });

    res.status(200).json({ success: true, user: {
      id: updatedUser.empId,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      department: updatedUser.department,
      designation: updatedUser.designation,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      attendance: userAttendance.map(a => ({ date: a.date, checkIn: a.checkIn, checkOut: a.checkOut, status: a.status }))
    }});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findOneAndDelete({ empId: id });
    await Attendance.deleteMany({ employeeId: id });
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, updateUser, deleteUser };