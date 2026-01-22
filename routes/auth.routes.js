const express = require('express');
const pool = require('../config/db');
const {userSignUpSchema, userLogInSchema } = require('../schemas/user.schemas');
const bcrypt = require('bcrypt');
const AppError = require('../errors/AppError');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config({
    path: './config/.env'
});

const router = express.Router();

const JWTSECRETKEY = process.env.JWTSECRETKEY;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

// get all users
router.get('/users', async(req, res, next) =>{
    try{
        const getAllUsers = await pool.query(
        `SELECT user_name
        FROM users;`
    );

    res.status(200).json({users:  getAllUsers.rows});
    }
    catch(err)
    {
        next(err);
    }
});

// signup
router.post('/users', async(req, res, next) => {
    try{
        // input validation
        const parseduserSignUpSchema = userSignUpSchema.parse({username: req.body.username, password: req.body.password, role: req.body.role});

        // application logic
        // hash generation
        const passwordHash = await bcrypt.hash(parseduserSignUpSchema.password, SALT_ROUNDS);



        // creating new user in DB
        const result = await pool.query(  
            `INSERT INTO users(user_name, user_password, role_id)
            VALUES($1, $2, (SELECT role_id FROM roles WHERE role_name = $3))`,
            [parseduserSignUpSchema.username, passwordHash, parseduserSignUpSchema.role]
        );


        if(!result.rowCount) throw new AppError("User Creation Failed");
        
        res.status(201).json({result: "User Created Successfully"});


    }catch(err)
    {
        next(err);
    }
});

//login
router.post('/login', async (req, res, next) => {
    try{
        // input validation
        const parseduserLogInSchema = userLogInSchema.parse(req.body);

        
        // application logic
        const result = await pool.query(
            `SELECT u.user_id, u.user_password, r.role_name, r.permissions
            FROM users AS u
            JOIN roles AS r
            ON u.role_id = r.role_id
            WHERE u.user_name = $1`,
            [parseduserLogInSchema.username]
        );
        
    if(!result.rowCount) throw new AppError("User doesn't exist", 404);
    
    // password hash compare
    const isVerified = await bcrypt.compare(parseduserLogInSchema.password, result.rows[0].user_password);
    
    if(!isVerified) throw new AppError("Invalid Credentials", 401);

    // generate jwt
    const token = jwt.sign({
        sub : result.rows[0].user_id, 
        role :result.rows[0].role_name
    }, 
        JWTSECRETKEY);
        

    res.status(200).json(
        {
            token: token,
            message: "Logged In Successfully",
            permissions: result.rows[0].permissions
        });
        }
    catch(err){
        next(err);
    }

});

// router.get('/me): to get users own permissions: maybe later if i need it


module.exports = router;