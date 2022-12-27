const User = require("../models/User");

module.exports = async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findOne({ _id: req.session.userId });
    console.log(user);
    console.log(req.session);
    if (req.session.userType === "admin") {
      return res.render("home", { userName: user.userName, admin: "true" });
    } else if (req.session.userType === "examiner") {
      return res.render("home", { userName: user.userName, examiner: "true" });
    }

    return res.render("home", { userName: user.userName, driver: "true" }); // TO SHOW USERNAME ON THE HOME PAGE IF LOGGED IN
  } else {
    next();
  }
};
