const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    recipeID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Recipe'
    },

    originID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Origin'
    },

    main_ingredientsID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Ingredient'
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
module.exports = mongoose.model('Tag', TagSchema);