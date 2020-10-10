// load những thứ chúng ta cần
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
// Lấy thông tin những giá trị auth
const configAuth = require('./authFacebook');
// load  user model
const User = require('../models/user');

module.exports = passport => {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
            // điền thông tin để xác thực với Facebook.
            // những thông tin này đã được điền ở file auth.js
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id','displayName','email','first_name','last_name','middle_name', 'photos']
        },
        // Facebook sẽ gửi lại chuối token và thông tin profile của user
        function (token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function () {
                // tìm trong db xem có user nào đã sử dụng facebook id này chưa
                User.findOne({'facebook.id': profile.id}, function (err, user) {
                    if (err)
                        return done(err);
                    // Nếu tìm thấy user, cho họ đăng nhập
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // nếu chưa có, tạo mới user
                        var newUser = new User();
                        // lưu các thông tin cho user
                        newUser = {};
                        newUser.providerID = profile.id;
                        newUser.providerToken = token;
                        newUser.username = profile.name.givenName + ' ' + profile.name.familyName; // bạn có thể log đối tượng profile để xem cấu trúc
                        newUser.email = profile.emails[0].value; // fb có thể trả lại nhiều email, chúng ta lấy cái đầu tiền
                        newUser.profileImage = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                        // lưu vào db
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            // nếu thành công, trả lại user
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
};