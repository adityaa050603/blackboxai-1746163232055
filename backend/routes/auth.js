const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin registration
router.post('/admin/register', authController.adminRegister);

// Admin login
router.post('/admin/login', authController.adminLogin);

// User login
router.post('/user/login', authController.userLogin);

// User registration
router.post('/user/register', authController.userRegister);

module.exports = router;
