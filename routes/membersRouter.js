const { Router } = require("express");
const membersController = require("../controllers/membersController");

const membersRouter = Router();

membersRouter.get("/", membersController.getHomePage);
membersRouter.get("/users/register", membersController.getRegistrationForm);
membersRouter.post("/users/register", membersController.createNewUser);
membersRouter.get("/login", membersController.getLoginPage);

module.exports = membersRouter;