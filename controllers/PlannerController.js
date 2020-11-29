const Recipe = require('../models/Recipe');
const Planner = require('../models/Planner');
const User = require('../models/user');
const sendEMail = require('../helpers/sendEmail');

exports.createPlanner = async function (req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    }

    //Make sure the passed id is that of the logged in user
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false, 
            message: "Sorry, you don't have the permission to update this data."
        });
    }


    try {
        const planner = {
            userID: req.user._id.toString(),
            date: req.body.date,
            hours: req.body.hours,
            note: req.body.note,
            recipeID: req.body.recipeID
        }


        if (!planner.recipeID) {
            return res.json({
                success: false,
                message: 'Param recipeID truyền lên không xác định!'
            });
        } else {
            const checkRecipe = await Recipe.findOne({
                _id: planner.recipeID,
                isDeleted: false
            })

            if (!checkRecipe || checkRecipe == '' || checkRecipe == null) {
                return res.json({
                    success: false,
                    message: 'Recipe không tồn tại.'
                });
            }
        }

        if (!planner.date) {
            return res.json({
                success: false,
                message: 'Param date truyền lên không xác định!'
            });
        }


        const newplanner = await Planner.create(planner);

        if (!newplanner || newplanner == '' || newplanner == null) {
            return res.json({
                success: false,
                message: 'Lỗi...Tạo bản ghi không thành công!. Vui lòng thử lại.'
            });
        } else {
            const _planners = await Planner.find({
                userID: planner.userID,
                isDeleted: false
            })
            .sort({createdAt: -1})
            .populate('recipeID');


            return res.json({
                success: true,
                Planners: _planners
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};


exports.getAllPlannersOfUser = async function (req, res) {
    try {
        const userID = req.query.userID;

        if (!userID) {
            return res.json({
                success: false,
                message: 'Param userID truyền lên không xác định!'
            });
        } else {
            const checkPlanner = await Planner.find({
                userID: userID,
                isDeleted: false
            })
            .sort({createdAt: -1})
            .populate('recipeID');
            // .populate({
            //     path: 'userID',
            //     select: 'username profileImage',
            //     model: User
            // });

            if (!checkPlanner || checkPlanner == '' || checkPlanner == null) {
                return res.json({
                    success: false,
                    message: 'Không có đánh giá nào.'
                });
            } else {
                return res.json({
                    success: true,
                    Planners: checkPlanner
                });
            }
        }
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};

exports.removePlanner = async function (req, res) {
    //Make sure the passed id is that of the logged in user
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false, 
            message: "Sorry, you don't have the permission to update this data."
        });
    }

    try {
        const plannerID = req.query.plannerID;

        if (!plannerID) {
            return res.json({
                success: false,
                message: 'Param plannerID truyền lên không xác định!'
            });
        } else {
            const checkPlanner = await Planner.findOne({
                _id: plannerID,
                isDeleted: false
            });

            if (!checkPlanner || checkPlanner == '' || checkPlanner == null) {
                return res.json({
                    success: false,
                    message: 'Không có kế hoạch nào.'
                });
            } else {
                console.log(req.user._id.toString());
                console.log(checkPlanner.userID.toString());

                if (req.user._id.toString() === checkPlanner.userID.toString()) {
                    const _planner = await Planner.findOneAndUpdate({
                        _id: plannerID,
                        isDeleted: false 
                    }, 
                    {
                        isDeleted: true
                    }, 
                    {new: true});
                    if (!_planner || _planner == null || _planner == '') {
                        return res.status(500).json({
                            success: false,
                            code: "ERROR-011",
                            message: 'Hủy bản ghi không thành công!'
                        });
                    } else {
                        const checkPlanner = await Planner.find({
                            userID: userID,
                            isDeleted: false
                        })
                        .sort({createdAt: -1})
                        .populate('recipeID');
        
                        
                        return res.status(200).json({
                            success: true,
                            code: "SUCCESS-004",
                            message: 'Hủy bản ghi thành công.',
                            Planners: checkPlanner
                        }); 
                    }
                    
                } else {
                    return res.status(401).json({
                        success: false, 
                        message: "Bạn không có quyền xóa bản ghi này."
                    });
                }
            }
        }
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};