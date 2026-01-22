const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleAccessMiddleware = require('../middlewares/role.access.middleware');
const normalizeGender = require('../utils/normalize.gender');
const {employeeIdSchema, employeeSchema} = require('../schemas/employee.schemas');
const pool = require('../config/db');
const AppError = require('../errors/AppError');

const router = express.Router();


// create an employee
router.post('/employee-page', authMiddleware,roleAccessMiddleware('employee-page', 'C'), async(req, res,next) => {
    try{
        // normalizing and validating input
        const gender = req.body.gender;
        const normalizedGender = normalizeGender(gender);
        
        const parsedEmployeeSchema = employeeSchema.parse({name: req.body.name, phone: req.body.phone, gender: normalizedGender});

        
        // creating an employee
        const createResult = await pool.query(
            `INSERT INTO employees(emp_name, emp_phone, emp_gender)
            VALUES ($1, $2, $3)`,
            [parsedEmployeeSchema.name, parsedEmployeeSchema.phone, parsedEmployeeSchema.gender]
        );

        if(!createResult.rowCount) throw new AppError("Employee creation failed",500);

        res.status(201).json({message: "Employee Created Successfully"});

    }catch(err){
        next(err);
    }
});

//read all employee information
router.get('/employee-page', authMiddleware, roleAccessMiddleware('employee-page', 'R'), async(req, res, next) => {
    try{
        //reading employees data

        const employeesResult = await pool.query(
            `SELECT emp_id, emp_name,emp_phone, emp_gender
            FROM employees`
        );

        res.send(employeesResult.rows);
    }catch(err){
        next(err);
    }
});

//update one employee
router.put('/employee-page/:id', authMiddleware, roleAccessMiddleware('employee-page', 'U'), async(req, res, next) =>{
    try{
        //input validation
        const parsedEmployeeSchema = employeeSchema.parse(
            {
                name : req.body.name,
                phone : req.body.phone,
                gender : normalizeGender(req.body.gender)
            }
        );

        const parsedEmployeeIdSchema = employeeIdSchema.parse({
            id: req.params.id
        });

        // updating in DB
        const updateResult = await pool.query(
            `UPDATE employees
            SET emp_name = $1,
            emp_phone = $2,
            emp_gender = $3
            WHERE emp_id = $4`,
        [   parsedEmployeeSchema.name, 
            parsedEmployeeSchema.phone,
            parsedEmployeeSchema.gender,
            parsedEmployeeIdSchema.id
        ]
        );


        if(!updateResult.rowCount) throw new AppError("Employee not found", 404);

        res.status(200).json({message: "Updated Successfully" });


    }catch(err)
    {
        next(err);
    }
});

//delete one employee
router.delete('/employee-page/:id', authMiddleware, roleAccessMiddleware('employee-page', 'D'), async(req, res, next) =>{
    try{
        // input validation
        const parsedEmployeeIdSchema = employeeIdSchema.parse(req.params);

        //deleting employee from DB

        const deleteResult = await pool.query(
            `DELETE 
            FROM employees
            WHERE emp_id = $1`,
            [parsedEmployeeIdSchema.id]
        );

        if(!deleteResult.rowCount) throw new AppError("Employee not found", 404);

        res.sendStatus(204);
    }catch(err){
        next(err);
    }
});


module.exports = router;