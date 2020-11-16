const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');


exports.createFavorite = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }

    //Make sure the passed id is that of the logged in user
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false, 
            message: "Sorry, you don't have the permission to update this data."
        });
    }

    try {
        const data = {
            userID: req.user._id,
            recipeID: req.body.recipeID,
        }

        if (!data.recipeID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-000",
                message: 'userID không xác định.'
            });
        } else {
            const checkRecipe = await Recipe.findOne({
                _id: data.recipeID,
                isDeleted: false
            });
    
            if (!checkRecipe) {
                return res.json({
                    success: false,
                    code: "ERROR-003",
                    message: 'Recipe không tồn tại.'
                });
            } 
        }


        const checkFavorite = await Favorite.findOne({
            recipeID: data.recipeID,
            isDeleted: false
        });

        if (checkFavorite) {
            return res.json({
                success: false,
                code: "ERROR-003",
                message: 'Recipe này đã được đánh dấu yêu thích.'
            });
        } else {
            const newFavorite = new Favorite(data);

            await newFavorite.save();

            if (!newFavorite || newFavorite == null || newFavorite == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-004",
                    message: 'Tạo bản ghi mới không thành công.'
                });
            } 

            const _favorites = await Favorite.find({
                userID: userID,
                isDeleted: false
            })
            .sort({createdAt: -1});

            return res.status(200).json({
                success: true,
                code: "SUCCESS-000",
                message: 'Danh sách Favorites.',
                Favorites: _favorites
            });            
        }

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-000",
            message: error.message
        })   
    }
};

exports.getAllFavorites = async function (req, res) {
    try {
        const _favorites = await Favorite.find({
            isDeleted: false 
        })
        .sort({createdAt: -1})
        .populate({
            path: 'recipeID',
            // select: 'category name img_url des',
            model: Recipe
        });
        
        if (!_favorites || _favorites == null || _favorites == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-009",
                message: 'Không tìm thấy bản ghi.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-003",
            message: 'Lấy bản ghi thành công.',
            Favorites: _favorites
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-003",
            message: error.message
        })   
    }
};

exports.getAllFavoritesOfUser = async function (req, res) {
    try {
        const userID = req.query.userID;

        if (!userID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-020",
                message: 'userID không xác định.'
            });
        } 

        const _favorites = await Favorite.find({
            userID: userID,
            isDeleted: false 
        })
        .sort({createdAt: -1})
        .populate({
            path: 'recipeID',
            // select: 'category name img_url des',
            model: Recipe
        });
        
        if (!_favorites || _favorites == null || _favorites == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-009",
                message: 'Không tìm thấy bản ghi.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-003",
            message: 'Lấy bản ghi thành công.',
            Favorites: _favorites
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-003",
            message: error.message
        })   
    }
};

exports.removeFavorite = async function (req, res) {
    try {
        const favoriteID = req.query.favoriteID;

        if (!favoriteID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-010",
                message: 'favoriteID không xác định.'
            });
        } 

        const _favorite = await Favorite.findOneAndUpdate({
            _id: favoriteID,
            isDeleted: false 
        }, 
        {
            isDeleted: true
        }, 
        {new: true});
        

        if (!_favorite || _favorite == null || _favorite == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-011",
                message: 'Hủy bản ghi không thành công! Kiểm tra lại favoriteID.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-004",
            message: 'Hủy bản ghi thành công.',
            // Origin: _origin
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-004",
            message: error.message
        })   
    }
};