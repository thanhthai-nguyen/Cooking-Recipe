const Recipe = require('../models/Recipe');
const Origin = require('../models/Origin');
const MainIngredient = require('../models/MainIngredient');
const Ingredient = require('../models/Ingredient');
const Step = require('../models/Step');
const Picture = require('../models/Picture');
const Tag = require('../models/Tag');
const PrepTime = require('../models/PrepTime');

const User = require('../models/user');




exports.createRecipe = async function (req, res) {
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
        const recipe = {
            userID: req.user._id,
            name: req.body.recipe.name,
            des: req.body.recipe.des,
            category: req.body.recipe.category,
            img_url: req.body.recipe.img_url,
            level: req.body.recipe.level,
            rate: req.body.recipe.rate,
            num_of_reviews: req.body.recipe.num_of_reviews
        }

        if (req.user.userRole === 'ADMIN') {
            recipe.isConfirmed = true
        }

        if (!recipe.name || !recipe.des || !recipe.category || !recipe.img_url || !recipe.level || !recipe.rate || !recipe.num_of_reviews) {
            return res.status(500).json({
                success: false,
                code: "ERROR-025",
                message: 'Dữ liệu truyền lên bị thiếu.'
            });
        }

        const _ingredients = req.body.ingredients;
        const _steps = req.body.steps;
        const _pictures = req.body.pictures;
        const _tags = req.body.tags;

        let flag = 0;
        await Promise.all(_ingredients.map(async ingredient => {
            if (!ingredient.content) {
                flag = 1;
                return res.json({
                    success: false,
                    code: "ERROR-026",
                    message: `ingredients: content ${ingredient.content} không xác định`
                });
            } 
            // return {
            //     content: ingredient.content,
            // }
        }));

        await Promise.all(_steps.map(async step => {
            if (!step.content) {
                flag = 1;
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

        await Promise.all(_pictures.map(async picture => {
            if (!picture.img_url) {
                flag = 1;
                return res.json({
                    success: false,
                    code: "ERROR-028",
                    message: `pictures: img_url ${picture.img_url} không xác định`
                });
            } 
            // return {
            //     img_url: picture.img_url,
            // }
        }));

        let l = 0;
        await Promise.all(_tags.map(async tag => {
            l++;
            if (!tag.originID && !tag.main_ingredientID) {
                flag = 1;
                return res.json({
                    success: false,
                    code: "ERROR-029",
                    message: `tags: originID hoặc main_ingredientID thứ ${l} không xác định`
                });
            } 

            if (tag.originID) {
                const checkOrigin = await Origin.findOne({
                    _id: tag.originID,
                    isDeleted: false
                });
        
                if (!checkOrigin) {
                    flag = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-030",
                        message: `tags: Origin ${tag.originID} không tồn tại.`
                    });
                }
            }

            if (tag.main_ingredientID) {
                const checkMainIngredient = await MainIngredient.findOne({
                    _id: tag.main_ingredientID,
                    isDeleted: false
                });
        
                if (!checkMainIngredient) {
                    flag = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-031",
                        message: `tags: MainIngredient ${tag.main_ingredientID} không tồn tại.`
                    });
                }
            }
            // return {
            //     originID: tag.originID ? tag.originID: null,
            //     main_ingredientID: tag.main_ingredientID ? tag.main_ingredientID: null,
            // }
        }));

        if (flag !== 1) {
            const newRecipe = await Recipe.create(recipe);

            if (!newRecipe || newRecipe == '' || newRecipe == null) {
                return res.json({
                    success: false, 
                    code: "ERROR-032",
                    message: 'Tạo Recipe không thành công.'
                });
            } else {
                const prep_time = {
                    recipeID: newRecipe.id,
                    prep: req.body.prep_time.prep,
                    cook: req.body.prep_time.cook,
                    total: req.body.prep_time.total,
                    servings: req.body.prep_time.servings,
                    yield: req.body.prep_time.yield,
                    nutrition_facts: req.body.prep_time.nutrition_facts,
                }
    
                const newPrepTime = await PrepTime.create(prep_time);
    
                await Promise.all(_ingredients.map(async ingredient => {
                    await Ingredient.create({
                        recipeID: newRecipe.id,
                        content: ingredient.content,
                    });
                }))
    
                await Promise.all(_steps.map(async step => {
                    await Step.create({
                        recipeID: newRecipe.id,
                        content: step.content,
                    });
                }))
    
                await Promise.all(_pictures.map(async picture => {
                    await Picture.create({
                        recipeID: newRecipe.id,
                        img_url: picture.img_url,
                    });
                }))
    
                await Promise.all(_tags.map(async tag => {
                    await Tag.create({
                        recipeID: newRecipe.id,
                        originID: tag.originID,
                        main_ingredientID: tag.main_ingredientID
                    })
                }))
    
                const listIngredients = await Ingredient.find({
                    recipeID: newRecipe.id,
                    isDeleted: false
                }, 'content')
    
                const listSteps = await Step.find({
                    recipeID: newRecipe.id,
                    isDeleted: false
                }, 'content')
    
                const listPictures = await Picture.find({
                    recipeID: newRecipe.id,
                    isDeleted: false
                }, 'img_url')
    
                const listTags = await Tag.find({
                    recipeID: newRecipe.id,
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
                
                return res.json({
                    success: true,
                    code: "SUCCESS-010",
                    message: "Tạo Recipe thành công",
                    Recipe: newRecipe,
                    Ingredients: listIngredients,
                    Steps: listSteps,
                    Pictures: listPictures,
                    Tags: listTags,
                    PrepTime: newPrepTime
                })
            }
        }

       

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-010",
            message: error.message
        })   
    }
};

// Không cần token
exports.createRecipeNoToken = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }

    try {
        const recipe = {
            userID: req.body.recipe._id,
            name: req.body.recipe.name,
            des: req.body.recipe.des,
            category: req.body.recipe.category,
            img_url: req.body.recipe.img_url,
            level: req.body.recipe.level,
            rate: req.body.recipe.rate,
            num_of_reviews: req.body.recipe.num_of_reviews
        }

        const checkUser = await User.findOne({
            isDeleted: false
        })

        if (checkUser.userRole === 'ADMIN') {
            recipe.isConfirmed = true
        }

        if (!recipe.userID || !recipe.name || !recipe.des || !recipe.category || !recipe.img_url || !recipe.level || !recipe.rate || !recipe.num_of_reviews) {
            return res.status(500).json({
                success: false,
                code: "ERROR-025",
                message: 'Dữ liệu truyền lên bị thiếu.'
            });
        }

        const _ingredients = req.body.ingredients;
        const _steps = req.body.steps;
        const _pictures = req.body.pictures;
        const _tags = req.body.tags;

        let flag = 0;
        await Promise.all(_ingredients.map(async ingredient => {
            if (!ingredient.content) {
                flag = 1;
                return res.json({
                    success: false,
                    code: "ERROR-026",
                    message: `ingredients: content ${ingredient.content} không xác định`
                });
            } 
            // return {
            //     content: ingredient.content,
            // }
        }));

        await Promise.all(_steps.map(async step => {
            if (!step.content) {
                flag = 1;
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

        await Promise.all(_pictures.map(async picture => {
            if (!picture.img_url) {
                flag = 1;
                return res.json({
                    success: false,
                    code: "ERROR-028",
                    message: `pictures: img_url ${picture.img_url} không xác định`
                });
            } 
            // return {
            //     img_url: picture.img_url,
            // }
        }));

        let l = 0;
        await Promise.all(_tags.map(async tag => {
            l++;
            if (!tag.originID && !tag.main_ingredientID) {
                flag = 1;
                return res.json({
                    success: false,
                    code: "ERROR-029",
                    message: `tags: originID hoặc main_ingredientID thứ ${l} không xác định`
                });
            } 

            if (tag.originID) {
                const checkOrigin = await Origin.findOne({
                    _id: tag.originID,
                    isDeleted: false
                });
        
                if (!checkOrigin) {
                    flag = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-030",
                        message: `tags: Origin ${tag.originID} không tồn tại.`
                    });
                }
            }

            if (tag.main_ingredientID) {
                const checkMainIngredient = await MainIngredient.findOne({
                    _id: tag.main_ingredientID,
                    isDeleted: false
                });
        
                if (!checkMainIngredient) {
                    flag = 1;
                    return res.json({
                        success: false,
                        code: "ERROR-031",
                        message: `tags: MainIngredient ${tag.main_ingredientID} không tồn tại.`
                    });
                }
            }
            // return {
            //     originID: tag.originID ? tag.originID: null,
            //     main_ingredientID: tag.main_ingredientID ? tag.main_ingredientID: null,
            // }
        }));

        if (flag !== 1) {
            const newRecipe = await Recipe.create(recipe);

            if (!newRecipe || newRecipe == '' || newRecipe == null) {
                return res.json({
                    success: false, 
                    code: "ERROR-032",
                    message: 'Tạo Recipe không thành công.'
                });
            } else {
                const prep_time = {
                    recipeID: newRecipe.id,
                    prep: req.body.prep_time.prep,
                    cook: req.body.prep_time.cook,
                    total: req.body.prep_time.total,
                    servings: req.body.prep_time.servings,
                    yield: req.body.prep_time.yield,
                    nutrition_facts: req.body.prep_time.nutrition_facts,
                }
    
                const newPrepTime = await PrepTime.create(prep_time);
    
                await Promise.all(_ingredients.map(async ingredient => {
                    await Ingredient.create({
                        recipeID: newRecipe.id,
                        content: ingredient.content,
                    });
                }))
    
                await Promise.all(_steps.map(async step => {
                    await Step.create({
                        recipeID: newRecipe.id,
                        content: step.content,
                    });
                }))
    
                await Promise.all(_pictures.map(async picture => {
                    await Picture.create({
                        recipeID: newRecipe.id,
                        img_url: picture.img_url,
                    });
                }))
    
                await Promise.all(_tags.map(async tag => {
                    await Tag.create({
                        recipeID: newRecipe.id,
                        originID: tag.originID,
                        main_ingredientID: tag.main_ingredientID
                    })
                }))
    
                const listIngredients = await Ingredient.find({
                    recipeID: newRecipe.id,
                    isDeleted: false
                }, 'content')
    
                const listSteps = await Step.find({
                    recipeID: newRecipe.id,
                    isDeleted: false
                }, 'content')
    
                const listPictures = await Picture.find({
                    recipeID: newRecipe.id,
                    isDeleted: false
                }, 'img_url')
    
                const listTags = await Tag.find({
                    recipeID: newRecipe.id,
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
                
                return res.json({
                    success: true,
                    code: "SUCCESS-010",
                    message: "Tạo Recipe thành công",
                    Recipe: newRecipe,
                    Ingredients: listIngredients,
                    Steps: listSteps,
                    Pictures: listPictures,
                    Tags: listTags,
                    PrepTime: newPrepTime
                })
            }
        }


    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-010",
            message: error.message
        })   
    }
};

exports.updateRecipe = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const recipeID = req.body.recipeID;

        const update = req.body;


        if (!recipeID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-018",
                message: 'recipeID không xác định.'
            });
        } 

        const _recipe = await Recipe.findOneAndUpdate({
            _id: recipeID,
            isDeleted: false 
        }, update, {new: true});
        

        if (!_recipe || _recipe == null || _recipe == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-019",
                message: 'Cập nhật bản ghi không thành công! Kiểm tra lại recipeID.'
            });
        } 

        return res.status(200).json({
            success: true,
            code: "SUCCESS-006",
            message: 'Cập nhật thành công.',
            Recipe: _recipe
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-006",
            message: error.message
        })   
    }
};

exports.getRecipe = async function (req, res) {
    try {
        const recipeID = req.query.recipeID;

        if (!recipeID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-020",
                message: 'recipeID không xác định.'
            });
        } 

        const _recipe = await Recipe.findOne({
            _id: recipeID,
            isDeleted: false 
        });
        
        if (!_recipe || _recipe == null || _recipe == '') {
            return res.status(500).json({
                success: false,
                code: "ERROR-021",
                message: 'Không tìm thấy bản ghi.'
            });
        } else {
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
                message: "Lấy bản ghi thành công",
                Recipe: _recipe,
                Ingredients: listIngredients,
                Steps: listSteps,
                Pictures: listPictures,
                Tags: listTags,
                PrepTime: prepTime
            })
        }


    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-007",
            message: error.message
        })   
    }
};

exports.getAllRecipes = async function (req, res) {
    try {
        const _recipes = await Recipe.find({
            isDeleted: false 
        })
        .sort({createdAt: -1});
        
        if (!_recipes || _recipes == null || _recipes == '') {
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
            Recipes: _recipes
        }); 

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-008",
            message: error.message
        })   
    }
};

exports.removeRecipe = async function (req, res) {
    if (!req.body) {
        return res.status(500).json({
            success: false, 
            message: 'Empty body'
        });
    }
    try {
        const recipeID = req.query.recipeID;

        if (!recipeID) {
            return res.status(500).json({
                success: false,
                code: "ERROR-023",
                message: 'recipeID không xác định.'
            });
        } 

        await Promise.all([
            await Recipe.findOneAndUpdate({
                _id: recipeID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true}),
            await Ingredient.updateMany({ 
                recipeID: recipeID,
                isDeleted: false 
            }, 
            { 
                isDeleted: true 
            },
            {new: true}),
            await Step.updateMany({
                recipeID: recipeID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true}),
            await Picture.updateMany({
                recipeID: recipeID,
                isDeleted: false 
            }, 
            {
                isDeleted: true
            }, 
            {new: true}),
        ])
        .then(function (data) {
            return res.status(200).json({
                success: true,
                message: 'Recipe đã được hủy thành công.',
            });
        })
        .catch(function (data) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi...Hủy không thành công.'
            });
        });
        

    } catch (error) {
        return res.status(500).json({
            success: false, 
            code: "CATCH-009",
            message: error.message
        })   
    }
};