const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    recipeID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Recipe'
    },

    note: {
        type: String,
        required: false
    },

    stars: {
        type: Number,
        required: true,
        default: 0
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now    
    },

    updatedAt: {
        type: Date,
    },

    deletedAt: {
        type: Date,
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

ReviewSchema.pre(/^find/, function (next) {
    this
        .populate({
            path: "userID",
            select: "username profileImage",
        });
    next();
});


mongoose.set("useFindAndModify", false);
module.exports = mongoose.model('Review', ReviewSchema);