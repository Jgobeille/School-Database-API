// JavaScript exports

const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

const { User } = require('../models');

module.exports = {
  asyncHandler: (cb) => {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (err) {
        next(err);
      }
    };
  },
  authenticateUser: async (req, res, next) => {
    let message = null;
    // Parse the user's credentials from the Authorization header.

    const credentials = auth(req);

    if (credentials) {
      const users = await User.findAll();

      const user = users.find((u) => u.emailAddress === credentials.name);

      // If a user was successfully retrieved from the data store...

      if (user) {
        // Use the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.

        const authenticated = bcryptjs.compareSync(
          credentials.pass,
          user.password,
        );

        // If the passwords match...
        if (authenticated) {
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.firstName}`;
        }
      } else {
        message = `User not found for username: ${credentials.firstName}`;
      }
    } else {
      message = 'Auth header not found';
    }

    // If user authentication failed...
    if (message) {
      console.warn(message);
      // Return a response with a 401 Unauthorized HTTP status code.
      res.status(401).json({
        message: 'Access Denied',
      });
    } else {
      // Or if user authentication succeeded...
      // Call the next() method.
      next();
    }
  },
};
