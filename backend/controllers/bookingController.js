const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { propertyId, bookingDate } = req.body;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const booking = new Booking({
            user: req.user._id,
            property: propertyId,
            bookingDate,
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('property', 'title location print');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user', 'name email').populate('property', 'title');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for properties owned by the user
// @route   GET /api/bookings/ownerbookings
// @access  Private
const getOwnerBookings = async (req, res) => {
    try {
        // Find properties owned by the user
        const properties = await Property.find({ owner: req.user._id });
        const propertyIds = properties.map(p => p._id);

        // Find bookings for these properties
        const bookings = await Booking.find({ property: { $in: propertyIds } })
            .populate('user', 'name email')
            .populate('property', 'title location');

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner or Admin)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id).populate('property');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is admin or the owner of the property
        const isOwner = booking.property.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        booking.status = status || booking.status;
        const updatedBooking = await booking.save();

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookings,
    getOwnerBookings,
    updateBookingStatus,
};
