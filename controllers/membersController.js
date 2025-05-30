const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const membersDb = require("../db/queries");

const getHomePage = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("index", { title: "Club House", user: req.user });
  } else {
    res.render("index", { title: "Club House" });
  }
});

const getRegistrationForm = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard", { formData: '' });
  } else {
    res.render("registerUser", { title: "User Registration", formData: '' });
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
  body("membershipPassword").trim()
    .optional({ checkFalsy: true }),
  body("adminStatus")
    .customSanitizer((value, { req }) => {
      // If value is an array with checkbox and hidden field, then take the last value
      if (Array.isArray(value)) {
        return value[value.length - 1];
      };

      return value;
    })
    .isBoolean().withMessage(`Admin status ${boolErr}`)
];

const postUserToDb = asyncHandler(async (req, res, next) => {
  // Handle validation errors (if any)
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render("registerUser", {
      title: "Register New User",
      errors: errors.array(),
      formData: req.body
    });
  };

  try {
    const data = req.body;
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const membershipPassword = data.membershipPassword;
    
    let isPrivateMember = false;

    if (membershipPassword) {
      const membershipIsValid = await bcrypt.compare(
        membershipPassword, 
        process.env.MEMBERSHIP_HASH
      );

      if (!membershipIsValid) {
        return res.status(400).render("registerUser", {
          title: "Register New User",
          errors: [{ msg: "Invalid membership password." }],
          formData: req.body
        })
      };

      isPrivateMember = true;
    };
  
    // POST to db
    await membersDb.addNewUser(
      data.fullName, 
      data.username, 
      hashedPassword, 
      isPrivateMember, 
      data.adminStatus
    );
  
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    next(error);
  };
});

const createNewUser = [validateUserInfo, postUserToDb];

const getLoginPage = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("login", { 
      title: "Login",
      messages: req.flash("error")
     });
  }
});

const getDashboard = asyncHandler(async (req, res, next) => {
  const data = await membersDb.getAllMessages();

  if (req.isAuthenticated()) {
    res.render("dashboard", { title: "Dashboard", user: req.user, messages: data });
  } else {
    res.redirect("/login");
  }
});

const getNewMessageForm = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("createMessage", { title: "New Message", user: req.user });
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

const logUserOut = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    };

    res.redirect("/");
  });
});

const ensureAdmin = asyncHandler(async(req, res, next) => {
  // User must be logged in and an admin to delete message
  if (req.isAuthenticated() && req.user.admin) {
    return next();
  };

  res.status(403).send("Forbidden");
});

const deleteMessageById = asyncHandler(async (req, res, next) => {
  const messageId = req.params.messageId;

  try {
    await membersDb.deleteMessageById(messageId);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  };
});

module.exports = {
  getHomePage,
  getRegistrationForm,
  createNewUser,
  getLoginPage,
  getDashboard,
  getNewMessageForm,
  createNewMessage,
  logUserOut,
  ensureAdmin,
  deleteMessageById,
};