const express = require("express");
const userdb = require("../models/userSchema");
const router = new express.Router();
const bcrypt=require('bcryptjs')
const validator = require('validator');

// Registration route
router.post("/register", async (req, resp) => {
    // Extract data from the request body
    const { fname, email, password, cpassword } = req.body;

    try {
        // Validate email format
        if (!validator.isEmail(email)) {
            return resp.status(400).json({ error: "Invalid email format" });
        }

        // Check if user with the provided email already exists
        const preuser = await userdb.findOne({ email: email });
        if (preuser) {
            return resp.status(422).json({ error: "User already exists" });
        }

        // Create a new user document
        const finalUser = new userdb({
            fname: fname,
            email: email,
            password: password,
            cpassword: cpassword
        });

        // Save the new user document to the database
        const storeData = await finalUser.save();

        // Return success response
        return resp.status(201).json({ status: 201, storeData });
    } catch (error) {
        console.error("Error occurred during registration:", error);
        return resp.status(500).json({ error: "An error occurred during registration" });
    }
});

module.exports = router;
