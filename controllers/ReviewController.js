const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const User = require('../models/user');
const sendEMail = require('../helpers/sendEmail');


exports.createReview = async function (req, res) {
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
            const content = {};

            const review = {
                userID: req.user._id,
                stars: req.body.stars,
                note: req.body.note,
                recipeID: req.body.recipeID
            }


            if (!review.recipeID) {
                return res.json({
                    success: false,
                    message: 'Param recipeID truyền lên không xác định!'
                });
            } else {
                const checkRecipe = await Recipe.findOne({
                    _id: review.recipeID,
                    isDeleted: false
                })

                if (!checkRecipe || checkRecipe == '' || checkRecipe == null) {
                    return res.json({
                        success: false,
                        message: 'Recipe không tồn tại.'
                    });
                }

                content.ownerID = checkRecipe.userID.toString();
                content.recipe = checkRecipe.name;
            }

            if (!review.stars) {
                return res.json({
                    success: false,
                    message: 'Param stars truyền lên không xác định!'
                });
            }

            const newReview = await Review.create(review);

            if (!newReview || newReview == '' || newReview == null) {
                return res.json({
                    success: false,
                    message: 'Lỗi...Tạo đánh giá không thành công!. Vui lòng thử lại.'
                });
            } else {
                const _reviews = await Review.find({
                    recipeID: review.recipeID,
                    isDeleted: false
                })

                let _votes = _reviews.reduce((result, review) => {
                    return result + review.stars;
                  }, 0);

                 _votes = _votes / _reviews.length;
                 _votes = Math.round(_votes * 100 + Number.EPSILON) / 100;

                 const _recipe = await Recipe.findOne({
                    _id: review.recipeID,
                    isDeleted: false 
                })
                .populate('reviews');

                
                _recipe.rate = _votes;
                _recipe.num_of_reviews =  _reviews.length;

                await _recipe.save();

                const _owner = await User.findOne({ 
                    _id:  content.ownerID,
                    isDeleted: false 
                });
                 // send email
                let link = "http://" + req.headers.host;
                let html = `<p>Chào ${_owner.username}</p>
                            <p>Tài khoản ${req.user.username} đã bình luận về bài viết ${content.recipe} của bạn.</p> 
                            <p>Bài viết ${content.recipe} của bạn có ${_recipe.num_of_reviews} lượt bình luận và ${_recipe.rate} điểm đánh giá.</p>
                            <p>Xem chi tiết bài viết: <a href="${link}">xem tại đây.</a></p>`;

                await new sendEMail(_owner, html).notificationReview();

                return res.json({
                    success: true,
                    Recipe: _recipe
                });
            }

        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
};


exports.getAllReviewsOfRecipe = async function (req, res) {
        try {
            const recipeID = req.query.recipeID;

            if (!recipeID) {
                return res.json({
                    success: false,
                    message: 'Param recipeID truyền lên không xác định!'
                });
            } else {
                const checkReviews = await Review.find({
                    recipeID: recipeID,
                    isDeleted: false
                })
                .sort({createdAt: -1})
                // .populate({
                //     path: 'userID',
                //     select: 'username profileImage',
                //     model: User
                // });

                if (!checkReviews || checkReviews == '' || checkReviews == null) {
                    return res.json({
                        success: false,
                        message: 'Không có đánh giá nào.'
                    });
                } else {
                    return res.json({
                        success: true,
                        Reviews: checkReviews
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


exports.removeReview = async function (req, res) {
        //Make sure the passed id is that of the logged in user
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                success: false, 
                message: "Sorry, you don't have the permission to update this data."
            });
        }

        try {
            const reviewID = req.query.reviewID;

            if (!reviewID) {
                return res.json({
                    success: false,
                    message: 'Param reviewID truyền lên không xác định!'
                });
            } else {
                const checkReviews = await Review.findOne({
                    _id: reviewID,
                    isDeleted: false
                });

                if (!checkReviews || checkReviews == '' || checkReviews == null) {
                    return res.json({
                        success: false,
                        message: 'Không có đánh giá nào.'
                    });
                } else {
                    console.log(req.user._id.toString());
                    console.log(checkReviews.userID.toString());

                    if (req.user.userRole === 'ADMIN' || req.user._id.toString() === checkReviews.userID.toString()) {
                        const _review = await Review.findOneAndUpdate({
                            _id: reviewID,
                            isDeleted: false 
                        }, 
                        {
                            isDeleted: true
                        }, 
                        {new: true});
                        if (!_review || _review == null || _review == '') {
                            return res.status(500).json({
                                success: false,
                                code: "ERROR-011",
                                message: 'Hủy bản ghi không thành công!'
                            });
                        } else {
                            const _reviews = await Review.find({
                                recipeID: checkReviews.recipeID,
                                isDeleted: false
                            })
            
                            let _votes = _reviews.reduce((result, review) => {
                                return result + review.stars;
                              }, 0);
            
                             _votes = _votes / _reviews.length;
                             _votes = Math.round(_votes * 100 + Number.EPSILON) / 100;
            
                             const _recipe = await Recipe.findOne({
                                _id: checkReviews.recipeID,
                                isDeleted: false 
                            })
                            .populate('reviews');
            
                            
                            _recipe.rate = _votes;
                            _recipe.num_of_reviews =  _reviews.length;
            
                            await _recipe.save();

                            return res.status(200).json({
                                success: true,
                                code: "SUCCESS-004",
                                message: 'Hủy bản ghi thành công.',
                                Recipe: _recipe
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