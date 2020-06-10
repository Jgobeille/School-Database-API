// Express server
const express = require('express');

// imports

const bcryptjs = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// file imports
const { User } = require('../models');
const funcs = require('../js/functions.js');

// router server
const router = express.Router();

// validations for user
const validators = [
  check('firstName')
    .exists({
      checkNull: true,
      checkFalsy: true,
    })
    .withMessage('Please provide a value for "first name"'),
  check('lastName')
    .exists({
      checkNull: true,
      checkFalsy: true,
    })
    .withMessage('Please provide a value for "last name"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Email"')
    .isEmail()
    .withMessage('Please provide a valid email address for "Email"')
    .custom(async (value) => {
      // Get all users
      const users = await User.findAll();

      // Check if entered email matches other emails in db
      const sameEmail = await users.find((user) => user.emailAddress === value);

      // if match, throw error
      if (sameEmail) {
        throw new Error(
          'The email you entered is already in use. Please use a different email',
        );
      }

      // Indicates the success of this synchronous custom validator
      return true;
    }),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Password"')
    .isLength({ min: 8, max: 20 })
    .withMessage('Please provide password with 8 to 20 characters'),
];

// Send GET request to /users to return currently authenticatedUser
router.get('/users', funcs.authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
  });
});

// Send POST request to /users to create a new user
router.post('/users', validators, (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

  // If there are validation errors...
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);

    // Return the validation errors to the client.
    return res.status(400).json({
      errors: errorMessages,
    });
  }

  // Get the user from the request body.
  const user = req.body;

  // Hash the new user's password
  user.password = bcryptjs.hashSync(user.password);

  // Add the user to the `users` array.
  User.create(user);

  // Set the status to 201 Created and end the response.
  res.status(201).end();
});

module.exports = router;
