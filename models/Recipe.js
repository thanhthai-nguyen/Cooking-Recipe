const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    name: {
        type: String,
        required: true,
    },

    nameURL: {
        type: String,
        required: true,
    },

    des: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    img_url: {
        type: String,
        required: true,
    },

    level: {
        type: Number,
        required: true,
        default: 0
    },

    rate: {
        type: Number,
        required: true,
        default: 0
    },

    num_of_reviews: {
        type: Number,
        required: true,
        default: 0
    },

    like: {
        type: Number,
        required: true,
        default: 0
    },

    isConfirmed: {
        type: Boolean,
        default: false
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

}, {
    toJSON: { 
        virtuals: true 
    },
    toObject: { 
        virtuals: true 
    },
    timestamps: true
});

// Virtual populate
RecipeSchema.virtual("tags", {
    ref: "Tag",
    foreignField: "recipeID",
    localField: "_id",
    justOne: false,
    options: { 
        match: { 
            isDeleted: false 
        },
        // sort: { 
        //     createdAt: -1 
        // }, 
        // limit: 5 
    }
});

// Virtual populate
RecipeSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "recipeID",
    localField: "_id",
    justOne: false,
    options: { 
        match: { 
            isDeleted: false 
        },
        sort: { 
            createdAt: -1 
        }, 
        // limit: 5 
    }
});

mongoose.set("useFindAndModify", false);
module.exports = mongoose.model('Recipe', RecipeSchema);