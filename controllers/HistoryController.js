const History = require('../models/History');
const Recipe = require('../models/Recipe');


exports.createHistory = async function (req, res) {
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
            userID: req.user._id.toString(),
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
            } else {
                const newHistory = new History(data);

                await newHistory.save();
    
                if (!newHistory || newHistory == null || newHistory == '') {
                    return res.status(500).json({
                        success: false,
                        code: "ERROR-004",
                        message: 'Tạo bản ghi mới không thành công.'
                    });
                } 
    
                const _histories = await History.find({
                    userID: data.userID,
                    isDeleted: false
                })
                .sort({createdAt: -1});
    
                return res.status(200).json({
                    success: true,
                    code: "SUCCESS-000",
                    message: 'Danh sách Histories.',
                    Histories: _histories
                });            
            }
        }  

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-000",
            message: error.message
        })   
    }
};

exports.getAllHistories = async function (req, res) {
    try {
        const _histories = await History.find({
            isDeleted: false 
        })
        .sort({createdAt: -1})
        .populate({
            path: 'recipeID',
            // select: 'category name img_url des',
            model: Recipe
        });
        
        if (!_histories || _histories == null || _histories == '') {
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
            Histories: _histories
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-003",
            message: error.message
        })   
    }
};

exports.getAllHistoriesOfUser = async function (req, res) {
    try {
        const userID = req.query.userID;

        if (!userID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-020",
                message: 'userID không xác định.'
            });
        } 

        const _histories = await History.find({
            userID: userID,
            isDeleted: false 
        })
        .limit(20)
        .sort({createdAt: -1})
        .populate({
            path: 'recipeID',
            // select: 'category name img_url des',
            model: Recipe
        });
        
        if (!_histories || _histories == null || _histories == '') {
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
            Histories: _histories
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-003",
            message: error.message
        })   
    }
};

exports.removeHistory = async function (req, res) {
    try {
        const historyID = req.query.historyID;

        if (!historyID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-010",
                message: 'historyID không xác định.'
            });
        } 

        const _history = await History.findOneAndUpdate({
            _id: historyID,
            isDeleted: false 
        }, 
        {
            isDeleted: true
        }, 
        {new: true});
        

        if (!_history || _history == null || _history == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-011",
                message: 'Hủy bản ghi không thành công! Kiểm tra lại historyID.'
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

exports.removeAllHistories = async function (req, res) {
    try {
        const userID = req.query.userID;

        if (!userID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-010",
                message: 'userID không xác định.'
            });
        } 

        const _history = await History.findOneAndUpdate({
            userID: userID,
            isDeleted: false 
        }, 
        {
            isDeleted: true
        }, 
        {new: true});
        

        if (!_history || _history == null || _history == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-011",
                message: 'Hủy bản ghi không thành công! Kiểm tra lại userID.'
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