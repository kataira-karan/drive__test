const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;
// const Appointment = require("../models/Appointment");
const Appointment = require("../models/Appointment");

const UserSchema = mongoose.Schema({
  userName: String,
  password: String,
  firstName: String,
  lastName: String,
  userType: String,
  userId: String,
  dob: String,
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: "appointment",
  },
  isFeedback: Boolean,
  testType: String,
  address: {
    houseNo: Number,
    streetName: String,

    city: String,
    province: String,
    postalCode: String,
  },
  commentByExaminer: { type: String, default: "" },

  isTestPass: Boolean,
  car: {
    model: String,
    year: Number,
    plateNumber: String,
  },
  licenseNumber: String,
  image: String,
});

UserSchema.plugin(uniqueValidator);

// to use our schema we have to convert our schema into a model so we can work with it
const User = mongoose.model("User", UserSchema);

module.exports = User;
