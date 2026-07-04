const path = require('path');
const { check, body } = require('express-validator');
const express = require('express');

const adminController = require('../controllers/admin');
const { isLoggedIn: auth } = require('../middlewares/auth.middleware')
const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', auth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', auth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', auth,
    [
        body('title')
            .notEmpty().withMessage('Title is required')
            .isString().withMessage('Title must be a string')
            .isLength({ min: 3 }).withMessage('Title must be at least 3 characters')
            .trim(),
        body('imageUrl')
            .notEmpty().withMessage('Image URL is required')
            .isURL().withMessage('Please enter a valid URL')
            .trim(),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ gt: 0 }).withMessage('Price must be a positive number')
            .trim(),
        body('description')
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 5 }).withMessage('Description must be at least 5 characters')
            .trim()
    ],
    adminController.postAddProduct);

router.get('/edit-product/:productId', auth, adminController.getEditProduct);

router.post('/edit-product', auth, [
        body('title')
            .notEmpty().withMessage('Title is required')
            .isString().withMessage('Title must be a string')
            .isLength({ min: 3 }).withMessage('Title must be at least 3 characters')
            .trim(),
        body('imageUrl')
            .notEmpty().withMessage('Image URL is required')
            .isURL().withMessage('Please enter a valid URL')
            .trim(),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ gt: 0 }).withMessage('Price must be a positive number')
            .trim(),
        body('description')
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 5 }).withMessage('Description must be at least 5 characters')
            .trim()
    ],
    adminController.postEditProduct);

router.post('/delete-product', auth, adminController.postDeleteProduct);

module.exports = router;
