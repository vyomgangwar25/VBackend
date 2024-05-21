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



router.post("/login",async(req,resp)=>{
    // console.log(req.body)
    const{email,password}=req.body;
    try{
     const userValid=await userdb.findOne({email:email});
     if(userValid)
     {
         const isMatch= await  bcrypt.compare(password,userValid.password)
 
         if(!isMatch)
         {
             return resp.status(422).json({ error: "invalid data" });
         }
         else{
             //if match that is registered successfully then generate token
             // for token generation there is a secret key and a payload and add cookie
             const token = await userValid.generateAuthtoken();
             console.log(token)
 
           // cookiegeneration
           resp.cookie("usercookie",token,{
           expires:new Date(Date.now()+9000000),
           httpOnly:true
           })
 
          //send user and cookie to frontend
           const result={
             userValid,
             token
           }
           resp.status(201).json({status:201,result})
         }
     }
 
    } catch{
 
    }
 })
 

module.exports = router;
