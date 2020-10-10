const normal = require('./normal');
const auth = require('./auth');
// const socialAuth = require('./socialAuth');
const test = require('./test');
const authenticate = require('../middlewares/authenticate');

const passport = require('passport');


module.exports = app => {
    app.get('/', (req, res) => {
        res.render('home');
    });
    
    //api không cần xác thực
    app.use('/api/normal', normal);

    //api cần xác thực
    app.use('/api/auth', authenticate, auth);

    //api phụ dành cho việc test
    app.use('/api/test', test);

    // //api liên kết tài khoản mạng xã hội
    // app.use('/api/social', socialAuth);


     // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // yêu cầu xác thực bằng facebook
    app.get('/auth/facebook', 
    passport.authenticate('facebook', {scope: ['email']}));

    // xử lý sau khi user cho phép xác thực với facebook
    app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        session: false
        }), (req, res) => {
                if (req.user._id) {
                    res.json({
                        success: true,
                        _id: req.user._id
                    })
                } else {
                    res.json({
                        success: false
                })
            }
        }
    );
};