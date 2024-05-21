const express = require("express");
const userdb = require("../models/userSchema");
const router = new express.Router();
const bcrypt=require('bcryptjs')
const validator = require('validator');
const auth = require('../middleware/auth');

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
             console.log("ANV" , token ,"ABCd")
 
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



  //Task CRUD operations
// Create a task
router.post("/tasks", auth, async (req, resp) => {
    const { title, description } = req.body;
    // console.log(title, description)
    // console.log(req.user)
    const owner = req.user._id.toString();
    
    

    try {
        const task = new Task({ title, description, owner });
        await task.save();
        resp.status(201).json({ status: 201, task });
    } catch (error) {
        console.error("Error creating task:", error);
        resp.status(500).json({ error: "An error occurred while creating the task" });
    }
});

// Read all tasks
router.get("/tasks", auth, async (req, resp) => {
    try {
        await req.user.populate('tasks').execPopulate();
        resp.status(200).json({ status: 200, tasks: req.user.tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        resp.status(500).json({ error: "An error occurred while fetching tasks" });
    }
});

// Update a task
router.patch("/tasks/:id", auth, async (req, resp) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return resp.status(400).json({ error: "Invalid updates!" });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return resp.status(404).json({ error: "Task not found" });
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        resp.status(200).json({ status: 200, task });
    } catch (error) {
        console.error("Error updating task:", error);
        resp.status(500).json({ error: "An error occurred while updating the task" });
    }
});

// Delete a task
router.delete("/tasks/:id", auth, async (req, resp) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return resp.status(404).json({ error: "Task not found" });
        }

        resp.status(200).json({ status: 200, task });
    } catch (error) {
        console.error("Error deleting task:", error);
        resp.status(500).json({ error: "An error occurred while deleting the task" });
    }
});


 

module.exports = router;
