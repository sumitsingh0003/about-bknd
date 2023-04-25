const express = require('express');
const bcrypt = require("bcryptjs");
const multer  = require('multer');
const authentications = require("../middleware/authentications");
const router = express.Router();
const fs = require('fs');

require("../db/connection");
const User = require('../model/schema');

router.get('/', (req, res)=>{
    res.send("Home Page")
})

const storage = multer.diskStorage({   
    destination:(req, file, cb ) =>{
        cb(null, "public/images/");
     },
     
     filename:(req, file, cb ) =>{
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '_' + file.originalname);
     },
});

const upload = multer({storage: storage});


router.post('/register', upload.single('file'), async(req, res) =>{ 
   
    const {username, email, phone, city, password, cpassword, images } = req.body;
     
    if( !username || !email || !phone || !city || !password || !cpassword || !images ) {
        return res.status(422).json({error : "Please Fill the field form" });
    }
    
    try {
        const userExist = await User.findOne({email:email});
        if(userExist){
            return res.status(422).json({error : "Email Allready Exist" }, alert('hello'));
        }else if(password !== cpassword){
            return res.status(422).json({error : "Password Doesn't Same Please Check" }); 
        }else{
            const url = req.protocol + '://' + req.get('host');
            const user = new User({username, email, phone, city, password, cpassword, images:url + '/images/' + req.file.filename,});

            await user.save();
            res.status(201).json({message: "User Registration Succesfull"});
        }

    }catch (err) {
        console.log(err);
    }   
});


//Login Page
router.post('/login', async (req, res) =>{ 
    try {
        let token; 
        const {email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({error : "Please fill The Data" }); 
        }   
        const userEmail = await User.findOne({email:email});
        if(userEmail){
            const isMatch = await bcrypt.compare(password, userEmail.password);
            token = await userEmail.generateAuthToken();
            console.log("Middleware Funcktion create Token", token)
            res.header("Access-Control-Allow-Origin", "https://sumit-auth.netlify.app");
            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 86400000),  //24Hour k bad apne aap Log Out ho jayega (86400000 Milliseconds, 86400 Second, 1440 Minut, 24 Hours)
                httpOnly: true,
            })
           
            console.log(res.cookie("jwtoken", token), "Const Cookie Cookies")


            if(!isMatch){
               res.status(400).json({ err : "Invalid Detailes" });
            } else {
                res.json({message : "User Login Successfull", token:token});
            }
        }else {
            res.status(400).json({ err : "Invalid Detailes" });
        }
    } catch (error) {
         console.log(error);
    }
});


// aboutus ka Page
router.get('/about', authentications, (req, res) => {
    res.send(req.rootUser);
});


// Get Contact ka Page
router.get('/getdata', authentications, (req, res) => {
    res.send(req.rootUser);
});


// Send Contact Message Data
router.post('/contact', authentications, async (req, res) => {   
    try {
        const {username, email, phone, city, message } = req.body; 

        if( !username || !email || !phone || !city || !message) {
            return res.json({error : "Please Fill the Contact form" });
        }

        const userContct = await User.findOne({_id:req.userID});

        if(userContct){
            const userMessage = await userContct.addMessage(username, email, phone, city, message);
            await userContct.save();
            res.status(201).json({message: "user Contact successfully" })

        }

    }catch (err) {
        console.log(err);
    }
   
});

// Logout ka Page
router.get('/logout', (req, res) => {
    res.clearCookie("jwtoken", {path:'/'});
    res.status(200).send('User Logout')
});




module.exports = router;