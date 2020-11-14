const Recipe = require('../models/Recipe');
const Origin = require('../models/Origin');
const MainIngredient = require('../models/MainIngredient');
const Ingredient = require('../models/Ingredient');
const Step = require('../models/Step');
const Picture = require('../models/Picture');
const Tag = require('../models/Tag');
const PrepTime = require('../models/PrepTime');

const User = require('../models/user');


exports.addTags = async function (req, res) {
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

        const _tags = req.body.tags;


        let l = 0;
        let k = 0;
        await Promise.all(_tags.map(async tag => {
            if ((!tag.originID || tag.originID == null) && (!tag.main_ingredientID || tag.main_ingredientID == null)) {
                k = 1;
                return res.json({
                    success: false,
                    code: "ERROR-029",
                    message: `tags thứ ${l} không xác định`
                });
            } 

            if (tag.originID) {
                const checkExist = await Tag.findOne({
                    recipeID: recipeID,
                    originID: tag.originID,
                    isDeleted: false
                });

                if (checkExist) {
                    k = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-030",
                        message: `tags: Tag ${tag.originID} đã có.`
                    });
                }

                const checkOrigin = await Origin.findOne({
                    _id: tag.originID,
                    isDeleted: false
                });
        
                if (!checkOrigin) {
                    k = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-030",
                        message: `tags: Origin ${tag.originID} không tồn tại.`
                    });
                }
            }

            if (tag.main_ingredientID) {
                const checkExist = await Tag.findOne({
                    recipeID: recipeID,
                    main_ingredientID: tag.main_ingredientID,
                    isDeleted: false
                });

                if (checkExist) {
                    k = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-030",
                        message: `tags: Tag ${tag.main_ingredientID} đã có.`
                    });
                }

                const checkMainIngredient = await MainIngredient.findOne({
                    _id: tag.main_ingredientID,
                    isDeleted: false
                });
        
                if (!checkMainIngredient) {
                    k = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-031",
                        message: `tags: MainIngredient ${main_ingredientID} không tồn tại.`
                    });
                }
            }
            // return {
            //     originID: tag.originID ? tag.originID: null,
            //     main_ingredientID: tag.main_ingredientID ? tag.main_ingredientID: null,
            // }
        }));

       
        // await Promise.all(_tags.map(async tag => {
        //     await Tag.create({
        //         recipeID: recipeID,
        //         originID: tag.originID,
        //         main_ingredientID: tag.main_ingredientID
        //     })
        // }))

        if (k !== 1) {
            for (let i = 0; i < _tags.length; i++){
                new Tag({
                    recipeID: recipeID,
                    originID: _tags[i].originID,
                    main_ingredientID: _tags[i].main_ingredientID
                }).save();
            }
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
            message: "Thêm Tags thành công",
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


exports.removeTag = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const tagID = req.body.tagID;

        if (!tagID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-023",
                message: 'tagID không xác định.'
            });
        } else {
            const _tag = await Tag.findOneAndUpdate({
                _id: tagID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true});
            
    
            if (!_tag || _tag == null || _tag == '') {
                return res.status(500).json({
                    success: false,
                    code: "ERROR-024",
                    message: 'Hủy bản ghi không thành công! Kiểm tra lại tagID.'
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
