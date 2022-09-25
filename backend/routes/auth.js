const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

JWT_SECTER = "signature@mohit";


// Route 1 : Create a User using: POST "/api/auth/createuser". no login required
router.post('/createuser', [
    body('name', 'name must be atleast 3 charactar').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password must be atleast 5 charactar').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    //if error, then return error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    //check wheather email already exist or not
    try {

        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Email already exist" })
        }

        const salt = await bcrypt.genSaltSync(10);
        secPass = await bcrypt.hash(req.body.password, salt)
        //create a new user 
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,

        });
        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECTER);

        //res.json(user);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Route 2 : Authentication a user using: POST "/api/auth/login". no login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    //if error, then return error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success,errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).json({ success,errors: "please try to login with correct credentials" });
        }
        const passwordcompare = await bcrypt.compare(password, user.password);
        if (!passwordcompare) {
            success = false;
            return res.status(400).json({ success, errors: "please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECTER);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

});

// Route 3 : Get loggedin user details: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router