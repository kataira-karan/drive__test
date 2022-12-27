const e = require("connect-flash");
const express = require("express");
const appointmentController = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const flash = require("connect-flash");

appointmentController.get("/", async (req, res) => {
  if (req.session.userType === "admin") {
    const allAppointments = await Appointment.find({});
    console.log(allAppointments);

    if (req.flash("duplicateAppointment")) {
      console.log("flash", req.flash("duplicateAppointment"));

      const duplicateError = req.flash("duplicateAppointment");
      return res.render("appointment", {
        admin: true,
        allAppointments: allAppointments,
        message: duplicateError,
      });
    }

    return res.render("appointment", {
      admin: true,
      allAppointments: allAppointments,
    });
  }
  // res.render();
});

appointmentController.post("/bookappointment", async (req, res) => {
  const { appointment_date, appointment_start_at, appointment_end_at } =
    req.body;
  console.log(appointment_date, appointment_start_at, appointment_end_at);
  try {
    console.log(req.body);
    console.log("booking");

    // const date = `${appointment_date.getDate()} + ${appointment_date.getMonth()} + ${appointment_date.getYear()} `

    const appointment = await Appointment.find({ date: appointment_date })
      .where("appointmentStartAt")
      .equals("appointment_start_at")
      .where("appointmentEndAt")
      .equals("appointmentEndAt");

    console.log(`apppointment details ${appointment}`);
    if (appointment === null) {
      await Appointment.create({
        date: appointment_date,
        appointmentStartAt: appointment_start_at,
        appointmentEndAt: appointment_end_at,
        isTimeSlotAvailable: true,
        testType: "G2",
      });

      return res.redirect("/appointment");
    }

    req.flash("duplicateAppointment", "Duplicate Appointment");
    return res.redirect("/appointment");
  } catch (e) {
    res.send({ e: e.message });
  }
});

appointmentController.post("/checkavailableslot", async (req, res) => {
  try {
    var appointments = await Appointment.find({ date: req.body.date }).where({
      isTimeSlotAvailable: true,
    });
    // console.log(availableSlot)
    console.log(appointments);

    const user = await User.findOne({ _id: req.session.userId });
    console.log(user);
    res.render("g2_page", {
      user: user,
      driver: true,
      appointments: appointments,
    });
  } catch (e) {
    res.send({ e: "Somthing went wrong" });
  }
});

appointmentController.post("/bookmyappointment", async (req, res) => {
  const { appointmnet_appointmentId, appointment_date, appointmnet_time } =
    req.body;

  console.log(req.body);

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.session.userId },
      {
        appointmentId: appointmnet_appointmentId,
        testType: "G2",
      }
    );

    const user1 = await User.where("_id").equals(req.session.userId);

    // user.appointmentId = appointmnet_appointmentId;

    await Appointment.findOneAndUpdate(
      { _id: appointmnet_appointmentId },
      {
        testType: "G2",
        isTimeSlotAvailable: false,
      }
    );
    return res.redirect("/g2_page");

    // return res.render("g2_page", {
    //   user: user,
    //   driver: true,
    //   // isAppointmentBooked: true,
    //   isAppointmentBooked: req.body,
    // });
  } catch (e) {
    res.send({ e: e.message });
  }
});

appointmentController.get("/filterappointmentbydate", async (req, res) => {
  try {
    const { find_appointment_date } = req.body;

    console.log(req.body);
    const filteredAppointment = await Appointment.find({
      date: find_appointment_date,
    });

    console.log(`filtered appointment : ${filteredAppointment}`);

    return res.render("appointment", {
      admin: true,
      filteredAppointment: filteredAppointment,
    });
    // res.re
  } catch (e) {
    res.send({ e: e.message });
  }
});

// USER BOOKING APPOINTMENT FOR G

appointmentController.post("/bookmygappointment", async (req, res) => {
  const { appointmnet_appointmentId, appointment_date, appointmnet_time } =
    req.body;

  console.log(req.body);

  try {
    const user2 = await User.findOneAndUpdate(
      { _id: req.session.userId },
      {
        appointmentId: appointment_date,
        testType: "G",
      }
    );

    console.log(user2);

    // user.appointmentId = appointmnet_appointmentId;

    await Appointment.findOneAndUpdate(
      { _id: appointmnet_appointmentId },
      {
        testType: "G",
        isTimeSlotAvailable: false,
      }
    );

    return res.redirect("/g2_page");

    // return res.render("g2_page", {
    //   user: user2,
    //   driver: true,
    //   isAppointmentBooked: true,
    //   bookedAppointment: req.body,
    //   gAppointmentBooked: true,
    // });
  } catch (e) {
    console.log(e);
    res.send({ e: e.message });
  }
});

module.exports = appointmentController;
