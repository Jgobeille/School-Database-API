/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

// load modules

const express = require('express');
const morgan = require('morgan');

const { sequelize } = require('./models');

// routes
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

app.use(express.json());

// routes
app.use('/api', userRoutes);
app.use('/api', courseRoutes);

// TODO setup your api routes here

// Test db connection

// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: 'fsjstd-restapi.db',
// });

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection to the database successful!');
//   } catch (error) {
//     console.error('Error connecting to the database: ', error);
//   }
// })();

// sequelize.sync().then(() => {
//   console.log('All Models were synced');
// });

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, _next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
  // eslint-disable-next-line prettier/prettier
});
