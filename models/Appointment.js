const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  date: String,
  appointmentStartAt: String,
  appointmentEndAt: String,
  isTimeSlotAvailable: Boolean,
  testType: String,
});

const Appointment = mongoose.model("appointment", appointmentSchema);

module.exports = Appointment;
