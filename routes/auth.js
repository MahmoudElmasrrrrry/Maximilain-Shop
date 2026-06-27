const path = require('path');

const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignUp)
router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignUp);
router.post('/logout', authController.postLogout);

module.exports = router;
