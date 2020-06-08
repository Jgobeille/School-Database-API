const express = require('express');

const router = express.Router();

// const { User } = require('../models');

// Send GET request to /users to return currently authenticatedUser
router.get('/users', (req, res) => {
  const user = req.currentUser;

  res.json({
    name: user.name,
    username: user.username,
  });
});

// Send POST request to /users to create a new user
router.post('/users', (req, res) => {
  // Get the user from the request body.
  const user = req.body;

  // add user to db

  // Set the status to 201 Created and end the response.
  return res.status(201).end();
});

module.exports = router;
