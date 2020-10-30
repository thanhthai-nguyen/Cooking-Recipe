require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Token = require('../models/token');


const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: 'Your email is required',
        trim: true,
        lowercase: true
    },

    username: {
        type: String,
        unique: true,
        required: 'Your username is required',
    },

    password: {
        type: String,
        required: 'Your password is required',
        max: 100
    },

    providerToken: {
        type: String,
        required: false,
        trim: true,
    },

    providerID: {
        type: String,
        required: false,
        trim: true,
    },

    loginprovider: {
        type: String,
        required: false,
        trim: true,
    },

    profileImage: {
        type: String,
        required: false,
        trim: true,
    },

    userRole: {
        type: String,
        enum: ['ADMIN' , 'USER'],
        default: 'USER'
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isBlocked: {
        type: Boolean,
        default: false
    },
    
    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
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


// Hash password trước khi lưu
UserSchema.pre('save',  function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
        
            next();
        });
    });
});

// Kiểm tra password
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Tạo token
UserSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate());

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m' //expires in 15m
    });
};

// Tạo Refresh token
UserSchema.methods.generateJWTrefresh = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
    };

    return jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
        expiresIn: '43200m' //expires in 30d
    });
};

// Tạo password reset 
UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(64).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};


// Tạo token xác thực
UserSchema.methods.generateVerificationToken = function() {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(64).toString('hex')
    };

    return new Token(payload);
};


mongoose.set('useFindAndModify', false);

module.exports = mongoose.model('User', UserSchema);