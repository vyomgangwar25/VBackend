const jwt = require('jsonwebtoken');
const userdb = require('../models/userSchema');
const keySecret = 'vyomgangwarakarshgangwarakagargangwar';

const auth = async (req, resp, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, keySecret);
        const user = await userdb.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        console.log(user._id.toString()," ABCDE")

        next();
    } catch (error) {
        resp.status(401).json({ error: "Please authenticate." });
    }
};

module.exports = auth;
