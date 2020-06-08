const Sequelize = require('sequelize');

/**
 * Creates all models for db
 * @exports models to be used to update db
 * @return {Object} User model object
 */

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}

  /**
   * The init() method takes two arguments
   * 1.) object literal that defines the model's attributes -- each attribute is a column of the table.
   * 2.) object literal that sets the model options
   */
  User.init(
    // Arg1: model attributes
    {
      id: {
        type: Sequelize.INTEGER,
        // The ID acts as a 'primary key', or a unique indexable reference for each entry.
        primaryKey: true, // true intructs Sequelize to generate the primary key column using the property name defined in the model (in this case it's id, but it could be anything, like identifier). The ID should be a number, so its data type is INTEGER,
        autoIncrement: true, // true automatically generates an ID that increments by 1 for each new entry
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            // custom error message
            msg: 'Please provide a value for "first name"',
          },
          notNull: {
            msg: 'Please provide a value for "first name"',
          },
        },
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            // custom error message
            msg: 'Please provide a value for "last name"',
          },
          notNull: {
            msg: 'Please provide a value for "last name"',
          },
        },
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            // custom error message
            msg: 'Please provide a value for "email"',
          },
          notNull: {
            msg: 'Please provide a value for "email"',
          },
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            // custom error message
            msg: 'Please provide a value for "password"',
          },
          notNull: {
            msg: 'Please provide a value for "password"',
          },
        },
      },
    },
    // arg2: model options
    {
      sequelize, // same as {sequelize: sequelize}
    },
  );

  // create one to many association
  User.associate = (models) => {
    // TODO Add associations.
    User.hasMany(models.Course, {
      as: 'user',
      // configure nullability
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};
