const User = require("../models/User");

// THIS MIDDLEWARE WILL CHEACK IF USER IS LOGGED IN OR NOT
module.export = async (req, res, next) => {
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
