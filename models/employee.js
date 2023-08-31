const mongoose = require('mongoose');
const shortid = require('shortid');

const employeeSchema = new mongoose.Schema({
  code: { type: String, default: shortid.generate, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;