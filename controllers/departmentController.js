const Department = require("../models/Department");

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    const formatted = departments.map(d => ({ id: d.id, name: d.name }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const newDept = await Department.create({
      id: `DEPT${Date.now()}`,
      name: req.body.name
    });
    res.status(201).json({ id: newDept.id, name: newDept.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDepartments, createDepartment, deleteDepartment };