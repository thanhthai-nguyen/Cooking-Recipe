const mongoose = require('mongoose');

const PlannerSchema = new mongoose.Schema({
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

    date: {
        type: String,
        required: true
    },

    hours: {
        type: String,
        required: true
    },

    note: {
        type: String,
        required: false
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
module.exports = mongoose.model('Planner', PlannerSchema);