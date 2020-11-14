const MainIngredient = require('../models/MainIngredient');

exports.createMainIngredient = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const data = {
            category: req.body.category,
            name: req.body.name,
            img_url: req.body.img_url,
            des: req.body.des
        }

        if (!data.category) {
            return res.status(500).json({
                success: false,
                code: "ERROR-012",
                message: 'category không xác định.'
            });
        }

        if (!data.name) {
            return res.status(500).json({
                success: false,
                code: "ERROR-013",
                message: 'name không xác định.'
            });
        }

        if (!data.img_url) {
            return res.status(500).json({
                success: false,
                code: "ERROR-014",
                message: 'img_url không xác định.'
            });
        }

        if (!data.des) {
            return res.status(500).json({
                success: false,
                code: "ERROR-015",
                message: 'des không xác định.'
            });
        }

        const checkName = await MainIngredient.findOne({
            name: data.name,
            isDeleted: false
        });

        if (checkName) {
            return res.json({
                success: false,
                code: "ERROR-016",
                message: 'Name đã tồn tại.'
            });
        } else {
            const newMainIngredient = new MainIngredient(data);

            await newMainIngredient.save();

            if (!newMainIngredient || newMainIngredient == null || newMainIngredient == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-017",
                    message: 'Tạo bản ghi mới không thành công.'
                });
            } 

            const _mainIngredient = await MainIngredient.find({
                isDeleted: false
            })
            .sort('category ASC');

            return res.status(200).json({
                success: true,
                code: "SUCCESS-005",
                message: 'Danh sách MainIngredient.',
                MainIngredients: _mainIngredient
            });            
        }

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-005",
            message: error.message
        })   
    }
};

exports.updateMainIngredient = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const mainIngredientID = req.body.mainIngredientID;

        const update = req.body;


        if (!mainIngredientID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-018",
                message: 'mainIngredientID không xác định.'
            });
        } 

        const _mainIngredient = await MainIngredient.findOneAndUpdate({
            _id: mainIngredientID,
            isDeleted: false 
        }, update, {new: true});
        

        if (!_mainIngredient || _mainIngredient == null || _mainIngredient == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-019",
                message: 'Cập nhật bản ghi không thành công! Kiểm tra lại mainIngredientID.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-006",
            message: 'Cập nhật thành công.',
            MainIngredients: _mainIngredient
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-006",
            message: error.message
        })   
    }
};

exports.getMainIngredient = async function (req, res) {
    try {
        const name = req.query.name;

        if (!name) {
            return res.status(500).json({
                success: false,
                code: "ERROR-020",
                message: 'name không xác định.'
            });
        } 

        const _mainIngredient = await MainIngredient.findOne({
            name: name,
            isDeleted: false 
        });
        
        if (!_mainIngredient || _mainIngredient == null || _mainIngredient == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-021",
                message: 'Không tìm thấy bản ghi.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-007",
            message: 'Lấy bản ghi thành công.',
            MainIngredient: _mainIngredient
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-007",
            message: error.message
        })   
    }
};

exports.getAllMainIngredient = async function (req, res) {
    try {
        const _mainIngredient = await MainIngredient.find({
            isDeleted: false 
        })
        .sort('category ASC');
        
        if (!_mainIngredient || _mainIngredient == null || _mainIngredient == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-022",
                message: 'Không tìm thấy bản ghi.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-008",
            message: 'Lấy bản ghi thành công.',
            MainIngredient: _mainIngredient
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-008",
            message: error.message
        })   
    }
};

exports.removeMainIngredient = async function (req, res) {
    try {
        const mainIngredientID = req.query.mainIngredientID;

        if (!mainIngredientID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-023",
                message: 'mainIngredientID không xác định.'
            });
        } 

        const _mainIngredient = await MainIngredient.findOneAndUpdate({
            _id: mainIngredientID,
            isDeleted: false 
        }, 
        {
            isDeleted: true
        }, 
        {new: true});
        

        if (!_mainIngredient || _mainIngredient == null || _mainIngredient == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-024",
                message: 'Hủy bản ghi không thành công! Kiểm tra lại mainIngredientID.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-009",
            message: 'Hủy bản ghi thành công.',
            // Origin: _origin
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-009",
            message: error.message
        })   
    }
};