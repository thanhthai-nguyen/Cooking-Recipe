module.exports = {
    'facebookAuth': {
        'clientID': process.env.CLIENT_ID, // App ID của bản
        'clientSecret': process.env.CLIENT_SECRET, // App Secret của bạn
        'callbackURL': 'https://mellullaby.herokuapp.com/auth/facebook/callback'
    }
};
