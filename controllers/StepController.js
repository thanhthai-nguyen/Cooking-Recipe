const Recipe = require('../models/Recipe');
const Origin = require('../models/Origin');
const MainIngredient = require('../models/MainIngredient');
const Ingredient = require('../models/Ingredient');
const Step = require('../models/Step');
const Picture = require('../models/Picture');
const Tag = require('../models/Tag');
const PrepTime = require('../models/PrepTime');

const User = require('../models/user');


exports.updateStep = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const recipeID = req.body.recipeID;

        let flag = 0;
        await Promise.all(req.body.steps.map(async step => {
            if (!step.stepID) {
                flag = 1;
                return res.status(500).json({
                    success: false,
                    code: "ERROR-018",
                    message: `stepID ${step.stepID} không xác định.`
                });
            } 
        }))


        if (flag !== 1) {
            await Promise.all(req.body.steps.map(async step => {
                await Step.findOneAndUpdate({
                    _id: step.stepID,
                    isDeleted: false 
                }, 
                {
                    content: step.content
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


exports.addSteps = async function (req, res) {
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

        const _steps = req.body.steps;

        let k = 0;

        await Promise.all(_steps.map(async step => {
            if (!step.content) {
                k = 1;
                return res.json({
                    success: false,
                    code: "ERROR-027",
                    message: `steps: content ${step.content} không xác định`
                });
            } 
            // return {
            //     content: step.content,
            // }
        }));


        if (k !== 1) {
            await Promise.all(_steps.map(async step => {
                await Step.create({
                    recipeID: recipeID,
                    content: step.content,
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
            message: "Thêm Steps thành công",
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


exports.removeStep = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const stepID = req.body.stepID;

        if (!stepID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-023",
                message: 'stepID không xác định.'
            });
        } else {
            const _step = await Step.findOneAndUpdate({
                _id: stepID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true});
            
    
            if (!_step || _step == null || _step == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-024",
                    message: 'Hủy bản ghi không thành công! Kiểm tra lại stepID.'
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

