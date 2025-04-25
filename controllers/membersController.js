const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const membersDb = require("../db/queries");

const getHomePage = asyncHandler(async (req, res, next) => {
  res.render("index", { title: "Home Page"})
})

const getRegistrationForm = asyncHandler(async (req, res, next) => {
  res.render("registerUser", { title: "User Registration", });
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
  res.render("login", { title: "Login" });
});

module.exports = {
  getHomePage,
  getRegistrationForm,
  createNewUser,
  getLoginPage,
}