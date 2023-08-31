const mongoose = require('mongoose');

const employeePointsSchema = new mongoose.Schema({
    employeeCode: { type: String, required: true },
    pointsEarned: { type: Number, required: true },
    pointsBreakDown: { type: String },
});

const EmployeePoints = mongoose.model('EmployeePoints', employeePointsSchema);

module.exports = EmployeePoints;