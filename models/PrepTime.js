const mongoose = require('mongoose');

const PrepTimeSchema = new mongoose.Schema({
    recipeID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Recipe'
    },

    prep: {
        type: String,
        // required: true,
    },

    cook: {
        type: String,
        // required: true,
    },

    total: {
        type: String,
        // required: true,
    },

    servings: {
        type: String,
        // required: true,
    },

    yield: {
        type: String,
        // required: true,
    },

    nutrition_facts: {
        type: String,
        // required: true,
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
module.exports = mongoose.model('PrepTime', PrepTimeSchema);