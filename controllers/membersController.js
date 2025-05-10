const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const membersDb = require("../db/queries");

const getHomePage = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("index", { title: "Home Page", user: req.user });
  } else {
    res.render("index", { title: "Home Page" });
  }
});

const getRegistrationForm = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("registerUser", { title: "User Registration", });
  }
});

const alphaErr = "must only contain letters.";
const emailErr = "must be an email following the pattern: handle@domain.com.";
const passwordErr = "must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
const boolErr = "must be true or false.";

// Form validation middleware
const validateUserInfo = [
  body("fullName").trim()
    .matches(/^[A-Za-z\s]+$/).withMessage(`Full name ${alphaErr}`),
  body("username").trim()
    .isEmail().withMessage(`Username ${emailErr}`),
  body("password").trim()
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    .withMessage(`Password ${passwordErr}`),
  body("membershipStatus")
    .customSanitizer((value, { req }) => {
      // If value is an array with checkbox and hidden field, then take the last value
      if (Array.isArray(value)) {
        return value[value.length - 1];
      };

      return value;
    })
    .isBoolean().withMessage(`Membership status ${boolErr}`),
  body("adminStatus")
    .customSanitizer((value, { req }) => {
      // If value is an array with checkbox and hidden field, then take the last value
      if (Array.isArray(value)) {
        return value[value.length - 1];
      };

      return value;
    })
    .isBoolean().withMessage(`Membership status ${boolErr}`)
];

const postUserToDb = asyncHandler(async (req, res, next) => {
  // Handle validation errors (if any)
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render("registerUser", {
      title: "Register New User",
      errors: errors.array(),
    });
  };

  try {
    const data = req.body;
    const hashedPassword = await bcrypt.hash(data.password, 10);
  
    // POST to db
    await membersDb.addNewUser(
      data.fullName, 
      data.username, 
      hashedPassword, 
      data.membershipStatus, 
      data.adminStatus
    );
  
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    next(error);
  };
})

const createNewUser = [validateUserInfo, postUserToDb];

const getLoginPage = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("login", { title: "Login" });
  }
});

const getDashboard = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("dashboard", { title: "Dashboard", user: req.user });
  } else {
    res.redirect("/login");
  }
});

const getNewMessageForm = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("createMessage", { title: "New Message" });
  } else {
    res.redirect("/login");
  }
});

const cannotBeEmptyErr = "cannot be empty."
const titleLengthErr = "must be between 2-60 characters long."
const messageLengthErr = "must be between 2 and 5000 characters long."

// Sanitize and validate the data
const validateMessage = [
  body("messageTitle").trim()
    .notEmpty().withMessage(`Message title ${cannotBeEmptyErr}`)
    .isLength({ min: 2, max: 60}).withMessage(`Message title ${titleLengthErr}`),
  body("messageContent").trim()
    .notEmpty().withMessage(`Message content ${cannotBeEmptyErr}`)
    .isLength({ min: 2, max: 5000 }).withMessage(`Message content ${messageLengthErr}`)
];

const postNewMessage = asyncHandler(async (req, res, next) => {
  // handle any errors from validation (if any)
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("createMessage", {
      title: "New Message",
      errors: errors.array(),
    });
  };

  try {
    const message = req.body;
    await membersDb.postNewMessage(
      req.user.id, 
      message.messageTitle, 
      message.messageContent
    );
    
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    next(error);
  };
});

const createNewMessage = [validateMessage, postNewMessage];

module.exports = {
  getHomePage,
  getRegistrationForm,
  createNewUser,
  getLoginPage,
  getDashboard,
  getNewMessageForm,
  createNewMessage,
}