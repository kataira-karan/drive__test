const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const User = require("./models/User");
const path = require("path");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const expressSession = require("express-session");
const appointmentController = require("./controller/appointmentController");
const examinerController = require("./controller/examinerController");

// IMPORTING CONTROLLERS
const authController = require("./controller/authController");
const checkUserType = require("./middleware/checkUserType");
const Appointment = require("./models/Appointment");
const gAppointmentController = require("./controller/gAppointmentController");

const url =
  "mongodb+srv://dbuser:dbuser@cluster0.c1rdq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

app.use(
  expressSession({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

global.userId = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/");
  }
  next();
};

// USING MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
app.set("view engine", "ejs");
app.use(express.static("static"));

// CONTROLLERS
app.use("/auth", authController);
app.use("/appointment", appointmentController);
app.use("/examiner", examinerController);
app.use("/addGAppointment", gAppointmentController);

// app.use(session());

try {
  mongoose.connect(url, () => {
    console.log("database connecteed");
  });
} catch (e) {
  console.log(e);
}

const PORT = 5000;

// THIS MIDDLEWARE WILL CHEACK IF USER IS LOGGED IN OR NOT
const checkUser = async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findOne({ _id: req.session.userId });

    if (user.userType === "driver") {
      // res.render(page, { login: true, user: user });
      next();
    } else {
      res.send("You are not authorized to access this page");
    }
  } else {
    res.render("errorPage");
  }
};

app.get("/", checkUserType, async (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/g2_page", checkUser, async (req, res) => {
  const user = await User.findOne({ _id: req.session.userId });

  if (user.appointmentId != null) {
    const appointment = await Appointment.findOne({
      _id: user.appointmentId,
    });
    console.log("app", appointment);
    return res.render("g2_page", {
      user: user,
      driver: true,
      isAppointmentBooked: appointment,
    });
  }

  const appointment = await Appointment.find({});
  res.render("g2_page", {
    user: user,
    driver: true,
    appointments: appointment,
  });
});

app.get("/g_page", checkUser, async (req, res) => {
  const gAppointments = await Appointment.find({ testType: "G" })
    .where("isTimeSlotAvailable")
    .equals(true);

  res.render("g_page", { driver: true, gAppointments: gAppointments });
});

// ADD DATA WHEN USER IS LOGGED IN (for driver userType only)
app.post("/adduserinfo", async (req, res) => {
  try {
    //  CREATING NEW USER , THIS ALSO INCLUDE ADDING IMAGE

    const img1 = req.files.img1; // FILE OBJECT WHICH CONSIST OF IMAGE

    const salt = await bcrypt.genSalt(10);
    var hashedDob = await bcrypt.hash(req.body.dob, salt);
    var hasedLicenseNumber = await bcrypt.hash(req.body.licenseNumber, salt);
    //THIS MOVE(MV) FUNCTION SAVE AN IMAGE ON SERVER ON GIVEN PATH

    console.log(req.session.userId);

    // const u = await User.find({})

    let user1 = await User.findOneAndUpdate(
      { _id: req.session.userId },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userId: req.body.userId,
        dob: hashedDob,
        address: {
          houseNo: req.body.houseNo,
          streetName: req.body.streetName,
          city: req.body.city,
          province: req.body.province,
          postalCode: req.body.postalCode,
        },
        car: {
          model: req.body.carModel,
          year: req.body.carYear,
          plateNumber: req.body.plateNumber,
        },
        licenseNumber: hasedLicenseNumber,
      }
    );

    const user = await User.find({ _id: req.session.userId });
    console.log(user);

    // SENDING MESSAGE
    res.redirect("/g2_page");
  } catch (e) {
    // IF THERE IS AN ERROR
    res.send({ message: e.message, success: false });
  }
});

// FOR G INTERFACE USER CAN UPDATE DATA
app.post("/updateuser", async (req, res) => {
  //GETITING USER WHICH IS GOING TO BE UPDATED
  let user = await User.findOne({ userId: req.body.userId });

  // ONLY THIS FIELDS WIILL BE MODIFIED
  user.address.houseNo = req.body.houseNo;
  user.address.streetName = req.body.streetName;
  user.address.city = req.body.streetName;
  user.address.province = req.body.province;
  user.address.postalCode = req.body.postalCode;
  user.car.model = req.body.carModel;
  user.car.year = req.body.carYear;
  user.car.plateNumber = req.body.carPlateNumber;

  // SAVING UPDATED USER
  await user.save();

  // SENDING MESSAGE THAT USER IS UPDATED
  res.send({ message: "user updated ", success: true });

  try {
  } catch {
    // IF THERE IS AN ERROR VALUE OF SUCCESS WILL  BE FALSE
    res.send({ message: e.message, success: false });
  }
});

app.listen(5002, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
