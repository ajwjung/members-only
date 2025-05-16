require("dotenv").config();

const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");
const flash = require("connect-flash");
const membersRouter = require("./routes/membersRouter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(session({ 
  secret: "acnh", 
  resave: false, 
  saveUninitialized: false 
}));
app.use(flash());
app.use(passport.session());

app.use("/", membersRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message || "Something went wrong");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server listening on port ${PORT}`)
});