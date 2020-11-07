const mongoose = require('mongoose');

const MainIngredientSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    img_url: {
        type: String,
        required: true
    },

    des: {
        type: String,
        required: true
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
module.exports = mongoose.model('MainIngredient', MainIngredientSchema);