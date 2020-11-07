const Origin = require('../models/Origin');

exports.createOrigin = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const data = {
            name: req.body.name,
            img_url: req.body.img_url,
            des: req.body.des
        }

        if (!data.name) {
            return res.status(500).json({
                success: false,
                code: "ERROR-000",
                message: 'name không xác định.'
            });
        }

        if (!data.img_url) {
            return res.status(500).json({
                success: false,
                code: "ERROR-001",
                message: 'img_url không xác định.'
            });
        }

        if (!data.des) {
            return res.status(500).json({
                success: false,
                code: "ERROR-002",
                message: 'des không xác định.'
            });
        }

        const checkName = await Origin.findOne({
            name: data.name,
            isDeleted: false
        });

        if (checkName) {
            return res.json({
                success: false,
                code: "ERROR-003",
                message: 'Name đã tồn tại.'
            });
        } else {
            const newOrigin = new Origin(data);

            await newOrigin.save();

            if (!newOrigin || newOrigin == null || newOrigin == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-004",
                    message: 'Tạo bản ghi mới không thành công.'
                });
            } 

            const _origins = await Origin.find({
                isDeleted: false
            })
            .sort('name ASC');

            return res.status(200).json({
                success: true,
                code: "SUCCESS-000",
                message: 'Danh sách Origins.',
                Origins: _origins
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

exports.updateOrigin = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const originID = req.body.originID;

        const update = req.body;


        if (!originID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-005",
                message: 'originID không xác định.'
            });
        } 

        const _origin = await Origin.findOneAndUpdate({
            _id: originID,
            isDeleted: false 
        }, update, {new: true});
        

        if (!_origin || _origin == null || _origin == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-006",
                message: 'Cập nhật bản ghi không thành công! Kiểm tra lại originID.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-001",
            message: 'Cập nhật thành công.',
            Origin: _origin
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-001",
            message: error.message
        })   
    }
};

exports.getOrigin = async function (req, res) {
    try {
        const name = req.query.name;

        if (!name) {
            return res.status(500).json({
                success: false,
                code: "ERROR-007",
                message: 'name không xác định.'
            });
        } 

        const _origin = await Origin.findOne({
            name: name,
            isDeleted: false 
        });
        
        if (!_origin || _origin == null || _origin == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-008",
                message: 'Không tìm thấy bản ghi.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-002",
            message: 'Lấy bản ghi thành công.',
            Origin: _origin
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-002",
            message: error.message
        })   
    }
};

exports.getAllOrigins = async function (req, res) {
    try {
        const _origin = await Origin.find({
            isDeleted: false 
        })
        .sort('name ASC');
        
        if (!_origin || _origin == null || _origin == '') {
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
            Origin: _origin
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-003",
            message: error.message
        })   
    }
};

exports.removeOrigin = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const originID = req.body.originID;

        if (!originID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-010",
                message: 'originID không xác định.'
            });
        } 

        const _origin = await Origin.findOneAndUpdate({
            _id: originID,
            isDeleted: false 
        }, 
        {
            isDeleted: true
        }, 
        {new: true});
        

        if (!_origin || _origin == null || _origin == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-011",
                message: 'Hủy bản ghi không thành công! Kiểm tra lại originID.'
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