const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a property title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price per month'],
        },
        type: {
            type: String,
            required: [true, 'Please specify property type (e.g. Apartment, House, Villa)'],
        },
        image: {
            type: String,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        approved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Property', propertySchema);
