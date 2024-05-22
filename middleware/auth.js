const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');  
const keySecret = 'vyomgangwarakarshgangwarakagargangwar';

const auth = async (req, res, next) => {
    try {
         
        const token = req.header('Authorization').replace('Bearer ', '');
        
        
        const decoded = jwt.verify(token, keySecret);

         
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

         
        if (!user) {
            throw new Error();
        }

      
        req.token = token;
        req.user = user;

    e
        next();
    } catch (error) {
         
        res.status(401).json({ error: "Please authenticate." });
    }
};

module.exports = auth;
