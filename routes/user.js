// Express server
const express = require('express');

// Dependency imports
const bcryptjs = require('bcryptjs');

// file imports
const { User } = require('../models');
const { authenticateUser } = require('../js/functions.js');
const { userValidation, validationResultFunc } = require('../js/validation.js');

// router server
const router = express.Router();

/**
 * User Routes
 */

// Send GET request to /users to return currently authenticatedUser
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
  });
});

// Send POST request to /users to create a new user
// eslint-disable-next-line consistent-return
router.post('/users', userValidation, (req, res) => {
  // Attempt to get the validation result from the Request object.
  validationResultFunc(req, res);

  // Get the user from the request body.
  const user = req.body;

  // Hash the new user's password
  user.password = bcryptjs.hashSync(user.password);

  // Add the user to the `users` array.
  User.create(user);

  // Set the status to 201 Created and end the response.
  res.status(201).location('/').end();
});

module.exports = router;
