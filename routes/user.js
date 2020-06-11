// Express server
const express = require('express');

// Dependency imports
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

// file imports
const { User } = require('../models');
const { authenticateUser } = require('../js/functions.js');
const { validation } = require('../js/validation.js');

// router server
const router = express.Router();

/**
 * User Routes
 */

// Send GET request to /users to return currently authenticatedUser
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
  });
});

// Send POST request to /users to create a new user
// eslint-disable-next-line consistent-return
router.post('/users', validation, (req, res) => {
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
