const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const error = require('./middlewares/error.middleware');
const app = express();


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use(error);


module.exports = app;