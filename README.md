# Full Stack JavaScript Techdegree v2 - REST API Project

## Overview of the Provided Project Files

We've supplied the following files for you to use:

- The `seed` folder contains a starting set of data for your database in the form of a JSON file (`data.json`) and a collection of files (`context.js`, `database.js`, and `index.js`) that can be used to create your app's database and populate it with data (we'll explain how to do that below).
- We've included a `.gitignore` file to ensure that the `node_modules` folder doesn't get pushed to your GitHub repo.
- The `app.js` file configures Express to serve a simple REST API. We've also configured the `morgan` npm package to log HTTP requests/responses to the console. You'll update this file with the routes for the API. You'll update this file with the routes for the API.
- The `nodemon.js` file configures the nodemon Node.js module, which we are using to run your REST API.
- The `package.json` file (and the associated `package-lock.json` file) contain the project's npm configuration, which includes the project's dependencies.
- The `RESTAPI.postman_collection.json` file is a collection of Postman requests that you can use to test and explore your REST API.

## Getting Started

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install

```

Second, seed the SQLite database.

```
npm run seed
```

And lastly, start the application.

```
npm start
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).

---

# Explanation

This project is a REST API for a fullstack school course application. It uses one of the most popular databases(SQLite) to store data. Additionally, this app uses Node.JS and Sequelize to perform CRUD(Create, Read, Update, and Delete) operations that allow a user to update the database with new or existing information as well as delete information.
The API will provide a way for users to administer a school database containing information about courses: users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database. In addition, the project will require users to create an account and log-in to make changes to the database.

For a live demo of this project, go to this link: COMING SOON

## Motivation

---

My motivation for this project is create a backend for a fullstack school course application. This backend will allow a user to create an account to create, edit, and delete their own courses. This project also shows my working knowledge of creating routes with Node, using vanillaJS to make custom validations, using SEQUELIZE to interact with a database and make data modeling, validation, and persistence.

This project taught me how to:

- Create a SQLite database
- Interact with the database indirectly using an ORM like Sequelize
- Creating routes with Node.js
- Perform CRUD operations by passing data through Node.js routes
- Creating input validations using express-validations npm package
- Seed a database with starter data
- Create user authorization checks using basic-auth npm package
- Use Postman application to check if routes are performing CRUD operations correctly
- Create one to many and many to one associations between two models in a database
- Hashing passwords so data is not stored as plain text

## Technology Used

---

This project uses the following technologies:

- SQLite(https://www.sqlite.org/index.html)
- Sequelize ORM(https://sequelize.org/)
- Node.js(https://nodejs.org/en/)
- JavaScript
- CSS

NPM Packages

- basic-auth(https://www.npmjs.com/package/basic-auth)
- bcryptjs(https://www.npmjs.com/package/bcryptjs)
- sequelize-cli(https://www.npmjs.com/package/sequelize-cli)
- express-validator(https://www.npmjs.com/package/express-validator)

## Features

---

1. Users can create, read, update, and delete courses in the database
2. Users can create an account in the database
3. Input validation so users have to input required information before submitting to database
4. User authorization that checks to make sure that only the same user who created the course can edit, update, or delete that course
5. Error validation for input and user authorization

## Code Example

---

### User Authorization

- This function is middleware that checks to make sure a user is logged into an account before trying to create or make changes to a course
- This middleware uses basic-auth to perform the user authorization check

```javaScript

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
      // eslint-disable-next-line no-console
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
```

### User and Course Input Validations

- The userValidation and courseValidation arrays act as middleware to check if the user has submitted all relevant information before submitting to a database
- Custom validations that check if the email entered is formatted correctly and is not already in use by another user
- These middleware use Express-validator to check information
- validationResultFunc checks if there are any input errors. If there are any errors, it collects them all up and sends them as JSON

```javaScript

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
      // Return the validation errors to the client.
      res.status(400).json({
        errors: errorMessages,
      });
      return true;
    }

    return false;
  },
};
```

### Get specific Course Route

- This route retrieves a course a user searches for
- The Sequelize query returns a match to the id submitted and displays all relevant data about the course
- The query also displays all relevant information about the user associated with the course

```javaScript
// Send a GET request to /courses/:id - Returns a the course
// (including the user that owns the course) for the provided course ID
router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    // get the id
    const { id } = req.params;
    const course = await Course.findOne({
      where: { id },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt'],
          },
        },
      ],
    });
    // send the data to the browser as JSON
    if (course) {
      res.json({ course });
    } else {
      res.status(400).json({ message: 'Course not found' });
    }
  }),
);

```

### Update Course Route

- This route updates information about a course
- This route first checks if there are no errors in course input. Next, checks if the course exists or not. Then checks if the user making the change is the same user who is associated with the course

```javaScript
// Send a PUT request to /courses/:id UPDATE(edit) a course
router.put(
  '/courses/:id',
  authenticateUser,
  courseValidation,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Attempt to get the validation result from the Request object.
    const errorCheck = validationResultFunc(req, res);

    // get course
    const course = await Course.findByPk(id);
    if (!errorCheck) {
      if (course) {
        const currentUser = req.currentUser.id;
        if (course.userId === currentUser) {
          course.title = req.body.title;
          course.description = req.body.description;
          await course.update(req.body);
          // everything A O.K. status
          // end method tells express server that route is completed
          res.status(204).end();
        } else {
          res.status(403).json({
            message: 'This user is not authorized to edit this course',
          });
        }
      } else {
        res.status(404).json({ message: 'Course Not Found' });
      }
    }
  }),
);
```

## License

---

MIT © Jamie Gobeille 2020
