var jwt = require('jsonwebtoken');

JWT_SECTER = "signature@mohit";

const fetchuser =(req, res, next)=>{
    //Get the user form the JWT token and add id to reg object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({ errors: "please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECTER);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "please authenticate using a valid token" });
    }
}

module.exports = fetchuser;
