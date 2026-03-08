const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookings,
    getOwnerBookings,
    updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBooking)
    .get(protect, admin, getBookings);

router.route('/mybookings')
    .get(protect, getMyBookings);

router.route('/ownerbookings')
    .get(protect, getOwnerBookings);

router.route('/:id/status')
    .put(protect, updateBookingStatus);

module.exports = router;
