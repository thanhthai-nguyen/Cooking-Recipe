const Recipe = require('../models/Recipe');
const Origin = require('../models/Origin');
const MainIngredient = require('../models/MainIngredient');
const Ingredient = require('../models/Ingredient');
const Step = require('../models/Step');
const Picture = require('../models/Picture');
const Tag = require('../models/Tag');
const PrepTime = require('../models/PrepTime');

const User = require('../models/user');


exports.updatePrepTime = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const prep_timeID = req.body.prep_timeID;

        const update = req.body.prep_time;


        if (!prep_timeID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-018",
                message: 'prep_timeID không xác định.'
            });
        } 

        const _prepTime = await PrepTime.findOneAndUpdate({
            _id: prep_timeID,
            isDeleted: false 
        }, update, {new: true});
        

        if (!_prepTime || _prepTime == null || _prepTime == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-019",
                message: 'Cập nhật bản ghi không thành công! Kiểm tra lại prep_timeID.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-006",
            message: 'Cập nhật thành công.',
            PrepTime: _prepTime
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-006",
            message: error.message
        })   
    }
};


exports.removePrepTime = async function (req, res) {
    try {
        const prep_timeID = req.query.prep_timeID;

        if (!prep_timeID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-023",
                message: 'prep_timeID không xác định.'
            });
        } else {
            const _prepTime = await PrepTime.findOneAndUpdate({
                _id: prep_timeID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true});
            
    
            if (!_prepTime || _prepTime == null || _prepTime == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-024",
                    message: 'Hủy bản ghi không thành công! Kiểm tra lại prep_timeID.'
                });
            } 
    
            return res.status(200).json({
                success: true,
                code: "SUCCESS-009",
                message: 'Hủy bản ghi thành công.',
                // Origin: _origin
            }); 
        }

        

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-009",
            message: error.message
        })   
    }
};