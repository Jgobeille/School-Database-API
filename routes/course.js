const express = require('express');

const { Course } = require('../models');

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

// Send a GET request to /courses to READ a list of quotes
router.get(
  '/courses',
  asyncHandler(async (req, res, _next) => {
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

// Send a POST request to /quotes to CREATE a new quote
router.post(
  '/courses',
  asyncHandler(async (req, res, next) => {
    if (req.body.title && req.body.description) {
      const course = await Course.create({
        title: req.body.title,
        description: req.body.description,
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
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // get course
    const course = await Course.findByPk(id);
    if (course) {
      // reassign author and quote to new data user input
      course.title = req.body.title;
      course.description = req.body.description;

      await Course.update(course);
      // everything A O.K. status
      // end method tells express server that route is completed
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Course Not Found' });
      next();
    }
  }),
);

// Send a DELETE request to /courses/:id DELETE a course
router.delete(
  '/courses/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (course) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Quote Not Found' });
      next();
    }
  }),
);

module.exports = router;
