const path = require('path');
const { check, body } = require('express-validator');
const express = require('express');

const authController = require('../controllers/auth');
const User = require('../models/user');
const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignUp)
router.get('/reset-password', authController.getReset);
router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom(async (value, { req }) => {
                await User.findOne({ email: value }).then(user => {
                    if (user) {
                        return Promise.reject('Email already exists');
                    }
                })
            }),
        body('password', 'Password must be contain at least 5 charachter and numeric')
            .isLength({ min: 5 })
            .isAlphanumeric(),
        body('confirmPassword').trim().custom((value, { req }) => {
            if (value !== req.body.password) {
                return Promise.reject('Password confirmation does not match');
            }
            return true;
        })
    ]
    , authController.postSignUp);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.post('/reset-password', authController.postReset);
router.get('/reset-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
