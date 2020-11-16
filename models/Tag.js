const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    recipeID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Recipe'
    },

    originID: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'Origin'
    },

    main_ingredientID: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'MainIngredient'
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

TagSchema.pre(/^find/, function (next) {
    this
        .populate({
            path: "originID",
            select: "name img_url des",
        })
        .populate({
            path: "main_ingredientID",
            select: 'category name img_url des',
        });
    next();
  });

mongoose.set("useFindAndModify", false);
module.exports = mongoose.model('Tag', TagSchema);