const express = require('express');

// file imports
const { asyncHandler, authenticateUser } = require('../js/functions.js');
const { Course, User } = require('../models');
const {
  courseValidation,
  validationResultFunc,
} = require('../js/validation.js');

// router express server
const router = express.Router();

/**
 * Courses Routes
 */

// Send a GET request to /courses to READ a list of courses
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
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

    res.json({ courses });
  }),
);

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

// Send a POST request to /quotes to CREATE a new course
router.post(
  '/courses',
  authenticateUser,
  courseValidation,
  asyncHandler(async (req, res, next) => {
    // Attempt to get the validation result from the Request object.
    const errorCheck = validationResultFunc(req, res);

    if (!errorCheck) {
      const currentUser = req.currentUser.id;
      const course = req.body;
      const newCourse = await Course.create({
        title: course.title,
        description: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
        userId: currentUser,
      });
      res.status(201).location(`/courses/${newCourse.id}`).json();
    }
  }),
);

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

// Send a DELETE request to /courses/:id DELETE a course
router.delete(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res) => {
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
    }
  }),
);

module.exports = router;
