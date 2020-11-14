const Recipe = require('../models/Recipe');
const Origin = require('../models/Origin');
const MainIngredient = require('../models/MainIngredient');
const Ingredient = require('../models/Ingredient');
const Step = require('../models/Step');
const Picture = require('../models/Picture');
const Tag = require('../models/Tag');
const PrepTime = require('../models/PrepTime');

const User = require('../models/user');


exports.updateIngredient = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const recipeID = req.body.recipeID;

        let flag = 0;
        await Promise.all(req.body.ingredients.map(async ingredient => {
            if (!ingredient.ingredientID) {
                flag = 1;
                return res.status(500).json({
                    success: false,
                    code: "ERROR-018",
                    message: `stepID ${ingredient.ingredientID} không xác định.`
                });
            } 
        }))

        if (flag !== 1) {
            await Promise.all(req.body.ingredients.map(async ingredient => {
                await Ingredient.findOneAndUpdate({
                    _id: ingredient.ingredientID,
                    isDeleted: false 
                }, 
                {
                    content: ingredient.content
                }, 
                {
                    new: true
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
            message: "Cập nhật thành công",
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
            code: "CATCH-006",
            message: error.message
        })   
    }
};


exports.addIngredients = async function (req, res) {
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

        const _ingredients = req.body.ingredients;

        let k = 0;

        await Promise.all(_ingredients.map(async ingredient => {
            if (!ingredient.content) {
                k = 1;
                return res.json({
                    success: false,
                    code: "ERROR-027",
                    message: `steps: content ${ingredient.content} không xác định`
                });
            } 
            // return {
            //     content: step.content,
            // }
        }));


        if (k !== 1) {
            await Promise.all(_ingredients.map(async ingredient => {
                await Ingredient.create({
                    recipeID: recipeID,
                    content: ingredient.content,
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
            message: "Thêm Ingredients thành công",
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


exports.removeIngredient = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const ingredientID = req.body.ingredientID;

        if (!ingredientID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-023",
                message: 'ingredientID không xác định.'
            });
        } else {
            const _ingredient = await Ingredient.findOneAndUpdate({
                _id: ingredientID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true});
            
    
            if (!_ingredient || _ingredient == null || _ingredient == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-024",
                    message: 'Hủy bản ghi không thành công! Kiểm tra lại ingredientID.'
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