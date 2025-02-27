const User = require('../models/user');
const sendEMail = require('../helpers/sendEmail');


// Khôi phục password
// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
exports.recover = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ 
            email,
            isDeleted: false 
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'
            });
        }
        //Generate and set password reset token
        user.generatePasswordReset();

        // Save the updated user object
        await user.save();

        // send email
        let link = "http://" + req.headers.host + "/api/normal/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}</p>
                    <p>Please click on the following <a href="${link}">link</a> to reset your password.</p> 
                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

        await new sendEMail(user, html).passwordChangeRequest();

        return res.status(200).json({
            success: true, 
            message: 'A reset email has been sent to ' + user.email + '.'
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};


// @route POST api/auth/reset
// @desc Reset Password - Validate password reset token and shows the password reset view
// @access Public
exports.reset = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token, 
            resetPasswordExpires: {
                $gt: Date.now()
            },
            isDeleted: false
        });

        if (!user) {
                return res.status(401).json({
                success: false, 
                message: 'Password reset token is invalid or has expired.'
            });
        }

        //Redirect user to form with the email address
        res.render('reset', {user});
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        }) 
    }
};

// @route POST api/auth/reset
// @desc Reset Password
// @access Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token, 
            resetPasswordExpires: {
                $gt: Date.now()
            },
            isDeleted: false
        });

        if (!user) {
            return res.status(401).json({
                success: false, 
                message: 'Password reset token is invalid or has expired.'
            });
        }
        //Set the new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.isVerified = true;

        // Save the updated user object
        await user.save();

        let html = `<p>Hi ${user.username}</p>
                    <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`

        await new sendEMail(user, html).passwordHasBeenChanged();

        return res.status(200).json({
            success: true, 
            message: 'Your password has been updated.'
        });

    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })    
    }
};