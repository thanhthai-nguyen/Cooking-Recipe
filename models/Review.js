const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
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

    rate: {
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


mongoose.set("useFindAndModify", false);
module.exports = mongoose.model('History', HistorySchema);