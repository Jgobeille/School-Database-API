// Dependency imports
const { check, validationResult } = require('express-validator');

// file imports
const { User } = require('../models');

// validations for user
module.exports = {
  userValidation: [
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
        const sameEmail = await users.find(
          (user) => user.emailAddress === value,
        );

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
  ],
  courseValidation: [
    check('title')
      .exists({
        checkNull: true,
        checkFalsy: true,
      })
      .withMessage('Please provide a value for "title"'),
    check('description')
      .exists({
        checkNull: true,
        checkFalsy: true,
      })
      .withMessage('Please provide a value for "description"'),
  ],
  // eslint-disable-next-line consistent-return
  validationResultFunc: (req, res) => {
    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      console.log('error');
      // Return the validation errors to the client.
      res.status(400).json({
        errors: errorMessages,
      });
      return true;
    }

    return false;
  },
};
