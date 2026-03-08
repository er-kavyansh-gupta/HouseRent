const express = require('express');
const router = express.Router();
const {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
} = require('../controllers/propertyController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProperties)
    .post(protect, upload.single('image'), createProperty);

router.route('/:id')
    .get(getPropertyById)
    .put(protect, updateProperty)
    .delete(protect, deleteProperty);

module.exports = router;
