const express = require('express');

// file imports
const { asyncHandler, authenticateUser } = require('../js/functions.js');
const { Course } = require('../models');

// router express server
const router = express.Router();

/**
 * Courses Routes
 */

// Send a GET request to /courses to READ a list of courses
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll();

    const filteredCourseList = courses.map((course) => {
      return {
        title: course.title,
        description: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
        userId: course.userId,
      };
    });

    res.json({ filteredCourseList });
  }),
);

// Send a GET request to /courses/:id - Returns a the course
// (including the user that owns the course) for the provided course ID
router.get(
  '/courses/:id',
  asyncHandler(async (req, res, next) => {
    // get the id
    const { id } = req.params;
    const course = await Course.findByPk(id);
    // send the data to the browser as JSON
    if (course) {
      res.json({
        title: course.title,
        description: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
        userId: course.userId,
      });
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
      const currentUser = req.currentUser.id;
      const course = await Course.create({
        title: req.body.title,
        description: req.body.description,
        userId: currentUser,
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

    // get course
    const course = await Course.findByPk(id);

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
      const currentUser = req.currentUser.id;
      if (course.userId === currentUser) {
        await course.destroy();
        res.status(204).end();
      } else {
        res.status(403).json({
          message: 'This user is not authorized to delete this course',
        });
      }
    } else {
      res.status(404).json({ message: 'Course Not Found' });
      next();
    }
  }),
);

module.exports = router;
