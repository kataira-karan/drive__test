const e = require("connect-flash");
const express = require("express");
const gAppointmentController = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const flash = require("connect-flash");

gAppointmentController.get("/", async (req, res) => {
  const gAppointments = await Appointment.find({})
    .where("testType")
    .equals("G");

  const duplicateError = req.flash().duplicateError;
  console.log("ddddddd", duplicateError);

  // console.log(`flash message : ${req.flash("duplicateAppointment")}`);
  // res.send(req.flash("duplicateAppointment"));
  return res.render("addGAppointment", {
    admin: true,
    allAppointments: gAppointments,
    duplicateError: duplicateError,
  });
});

gAppointmentController.post("/addnewgappointment", async (req, res) => {
  console.log(req.body);
  const { appointment_date, appointment_start_at, appointment_end_at } =
    req.body;

  const appointment = await Appointment.findOne({ date: appointment_date })
    .where("testType")
    .equals("G")
    .where("appointmentStartAt")
    .equals(appointment_start_at)
    .where("appointmentEndAt")
    .equals(appointment_end_at);
  // console.log("appointment:", appointment);

  if (appointment === null) {
    await Appointment.create({
      date: appointment_date,
      appointmentStartAt: appointment_start_at,
      appointmentEndAt: appointment_end_at,
      isTimeSlotAvailable: true,
      testType: "G",
    });

    return res.redirect("/addGAppointment");
  }

  req.flash("duplicateError", "Duplicate Appointment");
  // res.send(req.flash("duplicateAppointment"));
  return res.redirect("/addGAppointment");
});

gAppointmentController.post("/filtergtestbydate", async (req, res) => {
  try {
    const { find_appointment_date } = req.body;

    console.log(req.body);
    const filteredAppointment = await Appointment.find({
      date: find_appointment_date,
    })
      .where("testType")
      .equals("G");

    console.log(`filtered appointment : ${filteredAppointment}`);

    // res.send(filteredAppointment);

    return res.render("addGAppointment", {
      admin: true,
      allAppointments: filteredAppointment,
    });

    // return res.render("addGAppointment", {
    //   admin: true,
    //   filteredAppointment: filteredAppointment,
    // });
    // res.re
  } catch (e) {
    res.send({ e: e.message });
  }
});

module.exports = gAppointmentController;
