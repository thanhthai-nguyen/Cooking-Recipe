require('dotenv').config();

const jwt = require('jsonwebtoken')
const User = require('../models/user');
const Token = require('../models/token');
const RefreshToken = require('../models/refreshtoken');


const sendEMail = require('../helpers/sendEmail');


// Đăng ký
exports.register = async (req, res) => {
    try {
        const { email } = req.body;

        // Make sure this account doesn't already exist
        const user = await User.findOne({ 
            email 
        });

        if (user) {
            return res.status(401).json({
                success: false,
                message: 'Email đã liên kết với tài khoản khác.'
            });
        }

        const newUser = new User({ 
            ...req.body, 
            role: "basic" 
        });

        newUser.profileImage = null;

        const user_ = await newUser.save();

        await sendVerificationEmail(user_, req, res);

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message
        })
    }
};

// Đăng nhập
exports.login = async  (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ 
            email 
        });

        if (!user) {
            return res.status(401).json({
                success: false, 
                message: 'Không tìm thấy địa chỉ mail ' + email
            });
        }
        //validate password
        if (!user.comparePassword(password)) {
            return res.status(401).json({
                success: false, 
                message: 'Email hoặc password không hợp lệ.'
            });
        } 

        // Make sure the user has been verified
        if (!user.isVerified) {
            return res.status(401).json({
                type: 'not-verified', 
                success: false, 
                message: 'Tài khoản chưa được xác thực.' });
        } 

        // Login successful, write token, and send back user
        const refreshToken = user.generateJWTrefresh();
        const checkToken = await RefreshToken.findOne({
            token: refreshToken
        });
        if (checkToken) {
            return res.status(401).json({
                success: false, 
                message: 'Đăng nhập bị lỗi! Vui lòng đăng nhập lại.'
            });
        }
        const newRefreshToken = new RefreshToken({
            userId: user._id,
            token: refreshToken
        });

        await newRefreshToken.save();

        return res.status(200).json({
            success: true, 
            message: 'Đăng nhập thành công.',
            accessToken: user.generateJWT(), 
            refreshToken: newRefreshToken.token, 
            user: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })
    }
};

// Tạo mới access token
exports.refreshToken = async  (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        
        const refreshToken = req.body.token;

        if (!refreshToken || refreshToken == null) {
            return res.sendStatus(401).json({
                success: false, 
                message: 'Refresh Token không xác định.'
            });
        }

        const checkToken = await RefreshToken.findOne({
            token: refreshToken
        });

        if (!checkToken) {
            return res.sendStatus(403).json({
                success: false, 
                message: 'RefreshToken đã hết hạn.'
            });
        }

        // verify and generate new access token
        jwt.verify(checkToken.token, process.env.JWT_SECRET_REFRESH, (err) => {
            if (err) {
                return res.sendStatus(403).json({
                    success: false, 
                    message: 'Lỗi xác thực. Vui lòng thử lại.'
                });
            } else {
                return res.json({ 
                    success: true, 
                    accessToken: user.generateJWT() 
                });
            }  
        });
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })
    }
};

// Đăng xuất
exports.logout = async  (req, res) => {
    try {
        await RefreshToken.deleteOne({
            token: req.body.token
        });

        return res.sendStatus(204).json({
            success: false, 
            message: 'Đăng xuất thành công.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })
    }
};

// ===EMAIL VERIFICATION
// @route GET api/auth/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
    if(!req.params.token) {
        return res.status(400).json({
            success: false, 
            message: "Không tìm thấy người dùng cho token này."
        });
    }

    try {
        // Find a matching token
        const token = await Token.findOne({ 
            token: req.params.token 
        });

        if (!token) {
                return res.status(400).json({ 
                success: false, 
                message: 'Token đã hết hạn.' 
            });
        }

        // If we found a token, find a matching user
        User.findOne({ _id: token.userId }, (err, user) => {
            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Không thể tìm thấy người dùng cho token này.' 
                });
            }

            if (user.isVerified) {
                res.render('verify');
            }

            // Verify and save the user
            user.isVerified = true;

            user.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        success: false, 
                        message:err.message
                    });
                } else {
                    res.render('verify');
                }

            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })
    }
};

// Gửi lại mail xác thực
// @route POST api/auth/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Địa chỉ mail ' + req.body.email + ' không được liên kết với tài khoản nào.'
            });
        }
        if (user.isVerified) {
            return res.status(400).json({ 
                success: true, 
                message: 'Tài khoản này đã được xác minh. Xin vui lòng đăng nhập.'
            });
        }

        await sendVerificationEmail(user, req, res);
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })
    }
};

// Gửi mail
async function sendVerificationEmail(user, req, res){
    try{
        const token = user.generateVerificationToken();

        // Save the verification token
        await token.save();

        let link="http://"+req.headers.host+"/api/normal/verify/"+token.token;
        let html = `<p>Hi ${user.username}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`;

        await new sendEMail(user, html).accountVerificationToken();

        return res.status(200).json({
            success: true, 
            message: 'A verification email has been sent to ' + user.email + '.'
        });
    }catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })    
    }
}
