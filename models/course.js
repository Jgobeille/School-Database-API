/* eslint-disable max-len */
const Sequelize = require('sequelize');

/**
 * Creates all models for db
 * @exports models to be used to update db
 * @return {Object} Course model object
 */

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}

  /**
   * The init() method takes two arguments
   * 1.) object literal that defines the model's attributes -- each attribute is a column of the table.
   * 2.) object literal that sets the model options
   */
  Course.init(
    // Arg1: model attributes
    {
      id: {
        type: Sequelize.INTEGER,
        // The ID acts as a 'primary key', or a unique indexable reference for each entry.
        primaryKey: true, // true intructs Sequelize to generate the primary key column using the property name defined in the model (in this case it's id, but it could be anything, like identifier). The ID should be a number, so its data type is INTEGER,
        autoIncrement: true, // true automatically generates an ID that increments by 1 for each new entry
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            // custom error message
            msg: 'Please provide a value for "title"',
          },
          notNull: {
            msg: 'Please provide a value for "title"',
          },
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            // custom error message
            msg: 'Please provide a value for "description"',
          },
          notNull: {
            msg: 'Please provide a value for "description"',
          },
        },
      },
      estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      materialsNeeded: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    // arg2: model options
    {
      sequelize, // same as {sequelize: sequelize}
    },
  );

  // add one-to-one association
  Course.associate = (models) => {
    // TODO Add associations.
    Course.belongsTo(models.User, {
      as: 'user',
      // configure nullability
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return Course;
};
