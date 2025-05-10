const { Router } = require("express");
const passport = require("passport");
const membersController = require("../controllers/membersController");

const membersRouter = Router();

membersRouter.get("/", membersController.getHomePage);
membersRouter.get("/users/register", membersController.getRegistrationForm);
membersRouter.post("/users/register", membersController.createNewUser);

membersRouter.get("/dashboard", membersController.getDashboard);

membersRouter.get("/login", membersController.getLoginPage);
membersRouter.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
}));

membersRouter.get("/messages/new", membersController.getNewMessageForm);
membersRouter.post("/messages/new", membersController.createNewMessage);

module.exports = membersRouter;