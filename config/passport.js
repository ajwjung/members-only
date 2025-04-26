const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const membersDb = require("../db/queries");

const verifyCallback = asyncHandler(async (username, password, done) => {
  try {
    const userInfo = await membersDb.getUserByUsername(username);
    const user = userInfo[0];
  
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    };
  
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return done(null, false, { message: "Incorrect password" });
    };
  
    return done(null, user);
  } catch (err) {
    return done(err);
  };
});

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

// Keep user logged in
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userInfo = await membersDb.getUserById(id);
    const user = userInfo[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});