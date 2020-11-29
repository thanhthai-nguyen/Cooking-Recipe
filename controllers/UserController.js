const User = require('../models/user');

const sendEMail = require('../helpers/sendEmail');
const {ObjectId} = require('mongodb');


// @route GET admin/user
// @desc Returns all users
// @access Public
exports.getAllUsers = async function (req, res) {
    try {
        if (req.user.userRole != 'ADMIN') {
            return res.status(401).json({
                success: false, 
                message: 'Bạn không đủ quyền để thực hiện thao tác này.'
            });
        } else {
            const users = await User.find({
                isDeleted: false
            })
            .sort('userRole DESC');
            
            return res.status(200).json({
                success: true, 
                Users: users
            });
        }  
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })   
    }
    

    // if (user.userRole != "ADMIN") {
    //     return res.status(401).json({
    //         success: false, 
    //         message: 'Bạn không đủ quyền để thực hiện thao tác này.'
    //     });
    // }

    // const users = await User.find({
    //     isDeleted: false
    // });
    // res.status(200).json({users});
};


// @route POST api/user
// @desc Add a new user
// @access Public
exports.store = async (req, res) => {
    try {
        const {email} = req.body;

        // Make sure this account doesn't already exist
        const user = await User.findOne({
            email,
            isDeleted: false
        });

        if (user) {
            return res.status(401).json({
                success: false, 
                message: 'Địa chỉ email bạn nhập đã được liên kết với một tài khoản khác.'
            });
        }
        const password = '_' + Math.random().toString(36).substr(2, 9); //generate a random password
        const newUser = new User({...req.body, password});

        const user_ = await newUser.save();

        //Generate and set password reset token
        user_.generatePasswordReset();

        // Save the updated user object
        await user_.save();

        //Get mail options
        let domain = "http://" + req.headers.host;
        let link = "http://" + req.headers.host + "/api/normal/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}<p><br><p>A new account has been created for you on ${domain}. Please click on the following <a href="${link}">link</a> to set your password and login.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`

        await new sendEMail(user, html).newAccountCreated();

        return res.status(200).json({
            success: true, 
            message: 'An email has been sent to ' + user.email + '.'
        });

    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })   
    }
};

// @route GET api/user/{id}
// @desc Returns a specific user
// @access Public
exports.show = async function (req, res) {
    try {
        const id = req.params.id;
        const userId = req.user._id;

        console.log(userId);
        const user = await User.findOne({
            _id: userId,
            isDeleted: false
        });

        if (!user) {
            return res.status(401).json({
                success: false, 
                message: 'Tài khoản không tồn tại.'
            });
        } else {
            return res.status(200).json({
                success: true, 
                User: user
            });
        }  
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })       
    }
};

// Cập nhật thông tin user
// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async function (req, res) {
    try {
        const update = req.body;
        const id = req.params.id;
        const userId = req.user._id;

        
        //Make sure the passed id is that of the logged in user
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                success: false, 
                message: "Sorry, you don't have the permission to update this data."
            });
        }
        // if they aren't redirect them to the home page
       // res.redirect('/');

        const user = await User.findByIdAndUpdate(userId, {$set: update}, {new: true});

        //if there is no image, return success message
        if (!req.file) {
            console.log('User '+ user.email +' updated profile');

            return res.status(200).json({
                success: true, 
                message: 'User has been updated',
                User: user
            });
        }
        
        // There is image
        const user_ = await User.findByIdAndUpdate(userId, 
            {
                $set: {
                    profileImage: req.file.filename
                }
            }, {new: true});

        console.log('User '+ user_.email +' uploaded image');

        return res.status(200).json({
            success: true, 
            message: 'User has been updated',
            User: user_, 
        });

    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })   
    }
};

// Xóa user
// @route POST api/user/{id}
// @desc Delete User
// @access Public
exports.remove = async function (req, res) {
    try {
        const id = req.params.id;
        const userId = req.user._id;

        //Make sure the passed id is that of the logged in user
        //if (user_id.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to delete this data."});
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                success: false, 
                message: "Sorry, you don't have the permission to delete this data."
            });
        }

        const user = await User.findOne({
            _id: userId,
            isDeleted: false
        });

        console.log(user);

        if (user.userRole != 'ADMIN') {
            return res.status(401).json({
                success: false, 
                message: 'Bạn không đủ quyền để thực hiện thao tác này.'
            });
        } 

        const removeUser = await User.findByIdAndUpdate(userId, 
            {
                $set: {
                    isDeleted: true
                }
            }, {new: true});

        if (!removeUser || removeUser == ''|| removeUser == null) {
            return res.status(500).json({
                success: false, 
                message: "Lỗi... Không thể xóa người dùng."
            })   
        } else {
            return res.status(200).json({
                success: true, 
                message: 'Tài khoản đã được xóa.'
            });
        }
            
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })   
    }
};


// User xóa tài khoản
// @route DELETE api/user/{id}
// @desc Delete User
// @access Public
exports.removeUser = async function (req, res) {
    try {
        const id = req.params.id;
        const userId = req.user._id;
        const { password } = req.body;

        //Make sure the passed id is that of the logged in user
        //if (user_id.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to delete this data."});
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                success: false, 
                message: "Sorry, you don't have the permission to delete this data."
            });
        }

        const user = await User.findOne({
            _id: userId,
            isDeleted: false
        });

        console.log(user);

        if (!user) {
            return res.status(401).json({
                success: false, 
                message: 'Không tìm thấy tài khoản.'
            });
        }
        //validate password
        if (!user.comparePassword(password)) {
            return res.status(401).json({
                success: false, 
                message: 'Password không hợp lệ.'
            });
        }  else {
            const removeUser = await User.findByIdAndUpdate(userId, 
                {
                    $set: {
                        isDeleted: true
                    }
                }, {new: true});
    
            if (!removeUser || removeUser == ''|| removeUser == null) {
                return res.status(500).json({
                    success: false, 
                    message: "Lỗi... Không thể xóa người dùng."
                })   
            } else {
                return res.status(200).json({
                    success: true, 
                    message: 'Tài khoản đã được xóa.'
                });
            }
        }     
            
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })   
    }
};



// @route POST api/user/{id}
// @desc Upload Image
// @access Public
exports.uploadimage = async function (req, res) {
    try {
       
        //Make sure the passed id is that of the logged in user
        if (!req.isAuthenticated()) return res.status(401).json({message: "Sorry, you don't have the permission to update this data."});
        // if they aren't redirect them to the home page
       // res.redirect('/');


        //if there is no image, return success message
        if (!req.file) {
            return res.status(401).json({
                success: false, 
                message: 'There is no image. Please check out again'
            });
        }
        
        // There is image
        return res.status(200).json({
            success: true, 
            profileImage: req.file.filename
        });

    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: error.message
        })       
    }
};



