const Recipe = require('../models/Recipe');
const Origin = require('../models/Origin');
const MainIngredient = require('../models/MainIngredient');
const Ingredient = require('../models/Ingredient');
const Step = require('../models/Step');
const Picture = require('../models/Picture');
const Tag = require('../models/Tag');
const PrepTime = require('../models/PrepTime');

const User = require('../models/user');


exports.addPictures = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }

    // //Make sure the passed id is that of the logged in user
    // if (!req.isAuthenticated()) {
    //     return res.status(401).json({
    //         success: false, 
    //         message: "Sorry, you don't have the permission to update this data."
    //     });
    // }

    try {
        const recipeID = req.body.recipeID;


        if (!recipeID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-025",
                message: 'recipeID không xác định.'
            });
        }

        const _pictures = req.body.pictures;

        let k = 0;

        await Promise.all(_pictures.map(async picture => {
            if (!picture.img_url) {
                k = 1;
                return res.json({
                    success: false,
                    code: "ERROR-027",
                    message: `_pictures: img_url ${picture.img_url} không xác định`
                });
            } 
            // return {
            //     content: step.content,
            // }
        }));


        if (k !== 1) {
            await Promise.all(_pictures.map(async picture => {
                await Picture.create({
                    recipeID: recipeID,
                    img_url: picture.img_url,
                });
            }))
        }
        
        const recipe = await Recipe.findOne({
            _id: recipeID,
            isDeleted: false
        });

        const listIngredients = await Ingredient.find({
            recipeID: recipeID,
            isDeleted: false
        }, 'content')

        const listSteps = await Step.find({
            recipeID: recipeID,
            isDeleted: false
        }, 'content')

        const listPictures = await Picture.find({
            recipeID: recipeID,
            isDeleted: false
        }, 'img_url')

        const listTags = await Tag.find({
            recipeID: recipeID,
            isDeleted: false
        }, 'originID main_ingredientID')
        .populate({
            path: 'originID',
            select: 'name img_url des',
            model: Origin
            })
        .populate({
            path: 'main_ingredientID',
            select: 'category name img_url des',
            model: MainIngredient
        });
        
        const prepTime = await PrepTime.find({
            recipeID: recipeID,
            isDeleted: false
        })

        return res.json({
            success: true,
            code: "SUCCESS-010",
            message: "Thêm Pictures thành công",
            Recipe: recipe,
            Ingredients: listIngredients,
            Steps: listSteps,
            Pictures: listPictures,
            Tags: listTags,
            PrepTime: prepTime
        })

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-010",
            message: error.message
        })   
    }
};


exports.removePicture = async function (req, res) {
    try {
        const pictureID = req.query.pictureID;

        if (!pictureID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-023",
                message: 'pictureID không xác định.'
            });
        } else {
            const _picture = await Picture.findOneAndUpdate({
                _id: pictureID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true});
            
    
            if (!_picture || _picture == null || _picture == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-024",
                    message: 'Hủy bản ghi không thành công! Kiểm tra lại pictureID.'
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

