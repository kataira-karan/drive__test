const e = require("connect-flash");
const express = require("express");
const examinerController = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const flash = require("connect-flash");

examinerController.get("/", async (req, res) => {
  console.log(`req.session: ${req.session.flash}`);
  console.log(`flash msg: ${req.flash("message")}`);

  const g2Users = await User.where("userType")
    .equals("driver")
    .where("testType")
    .equals("G2")
    .populate("appointmentId");

  const gUsers = await User.where("userType")
    .equals("driver")
    .where("testType")
    .equals("G")
    .populate("appointmentId");

  console.log(g2Users);
  console.log(gUsers);

  if (req.flash("message")) {
    return res.render("examiner", {
      g2Users: g2Users,
      gUsers: gUsers,
      examiner: true,
      message: req.flash("message"),
    });
  }

  res.render("examiner", { g2Users: g2Users, gUsers: gUsers, examiner: true });
  // res.render("examiner");
});

examinerController.get("/selectdriver/:_id", async (req, res) => {
  console.log(req.query);
  console.log(req.params);
  const user = await User.findOne({ _id: req.params._id }).populate(
    "appointmentId"
  );
  console.log(`Selected User: ${user}`);

  res.render("examinerUpdateDriver", { selectedDriver: user, examiner: true });
});

examinerController.post("/postdrivertestresult/:_id", async (req, res) => {
  console.log(req.body);
  req.flash("message", "user Updated");
  console.log(`req.params : ${req.params._id}`);
  var decision;
  if (req.body.decision === "pass") {
    decision = true;
  } else {
    decision = false;
  }

  await User.findOneAndUpdate(
    { _id: req.params._id },
    {
      commentByExaminer: req.body.commntOnTest,
      isTestPass: decision,
      isFeedback: true,
    }
  );

  res.redirect("/examiner");
});

module.exports = examinerController;
