const express = require('express');

const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const { Course, User } = require('../models');

const router = express.Router();

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

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

const authenticateUser = async (req, res, next) => {
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
};

// Send GET request to /users to return currently authenticatedUser
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
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

/**
 * Courses Routes
 */

// Send a GET request to /courses to READ a list of courses
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll();

    res.json(courses);
  }),
);

// Send a GET request to /courses/:id - Returns a the course
// (including the user that owns the course) for the provided course ID
router.get(
  '/courses/:id',
  asyncHandler(async (req, res, next) => {
    // get the id
    const { id } = req.params;
    // get the quote from the database
    const course = await Course.findByPk(id);
    // send the data to the browser as JSON
    if (course) {
      res.json(course);
    } else {
      res.status(400).json({ message: 'Course not found' });
      next();
    }
  }),
);

// Send a POST request to /quotes to CREATE a new course
router.post(
  '/courses',
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    if (req.body.title && req.body.description) {
      const course = await Course.create({
        title: req.body.title,
        description: req.body.description,
        userId: req.body.userId,
      });
      res.status(201).json(course);
    } else {
      // change status to 400 if info missing
      res.status(400).json({ message: 'title and description required' });
      next();
    }
  }),
);

// Send a PUT request to /courses/:id UPDATE(edit) a course
router.put(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    console.log(req.currentUser.id);

    // get course
    const course = await Course.findByPk(id);

    console.log(course.userId);

    if (course) {
      const currentUser = req.currentUser.id;
      if (course.userId === currentUser) {
        // reassign author and quote to new data user input
        course.title = req.body.title;
        course.description = req.body.description;

        await course.update(req.body);
        // everything A O.K. status
        // end method tells express server that route is completed
        res.status(204).end();
      } else {
        res
          .status(403)
          .json({ message: 'This user is not authorized to edit this course' });
      }
    } else {
      res.status(404).json({ message: 'Course Not Found' });
      next();
    }
  }),
);

// Send a DELETE request to /courses/:id DELETE a course
router.delete(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (course) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Course Not Found' });
      next();
    }
  }),
);

module.exports = router;
