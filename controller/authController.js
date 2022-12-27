const express = require("express");
const app = express();
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// adding new user (signup process)
authRouter.post("/addnewuser", async (req, res) => {
  try {
    if (req.body.password === req.body.confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      var hashedPassword = await bcrypt.hash(req.body.password, salt);
      await User.create({
        userName: req.body.userName,
        password: hashedPassword,
        userType: req.body.userType,
      });
      res.redirect("/login");
    } else {
      res.send({ message: "Password Do not match", success: false });
    }
  } catch (e) {
    res.send({ message: e.message, success: false });
  }
});

// login process
authRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    console.log(user);

    if (user) {
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        if (isMatch) {
          if (req.session.userId) {
            // destroy cookie if there is a previous login
            req.session.destroy();
          }

          if (user.userType === req.body.userType) {
            req.session.userId = user._id;
            req.session.userType = user.userType;

            res.redirect("/");
          } else {
            req.flash("errorMessage", "UserType is not correct");
            res.render("login", {
              message: "User does not exist",
              success: false,
              passwordError: req.flash("errorMessage"),
            });
            // return res.send({ message: "User Not found, " });
          }
        } else {
          req.flash("errorMessage", "Incorrect Password");
          res.render("login", {
            message: "User does not exist",
            success: false,
            passwordError: req.flash("errorMessage"),
          });
        }
      });
    } else {
      req.flash("errorMessage", "User Does not Exist");
      res.render("login", {
        message: "User does not exist",
        success: false,
        passwordError: req.flash("errorMessage"),
      });
    }
  } catch (e) {
    res.render("login", { message: "Somthing went wrong", success: false });
  }
});

authRouter.get("/logout", (req, res) => {
  console.log("log out process");
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = authRouter;
