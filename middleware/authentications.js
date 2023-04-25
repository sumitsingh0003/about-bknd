const jwt = require('jsonwebtoken');
const User = require('../model/schema');


const authentications = async (req, res, next) =>{

    try {
        console.log(req)
        //jo bhi hmara token generate hua use token m get kar liya or agar nahi hua to catch m chala jayega
        const token = req.cookies.jwtoken;
        console.log(req.cookies.jwtoken)
        //verifyToken m hamne jo hmara token h use verify kr liya generate ki hui token ki secret key k sath
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

        //user collection k andar se find kr rha h ki id verifyToken._id ho and tokens k andar uska jo token h wo match kar gya mere token se 
        //means user available h allready h to uska sara data rootUser m de dega 
        const rootUser = await User.findOne({_id:verifyToken._id, "tokens.token": token})

        if(!rootUser){
            throw new Error ('UserNot Found')
        }
        
        req.token = token;        //tokn se bhi hame uska data mil sakta hai like token._ID kare to bhi hame uska data mil kayega
        req.rootUser = rootUser; //rootUser m hmara sara k sara data milega us login kiye huye user ka ya fir hum rootUser._id bhi kar de to bhi hame us user ka sara data mil jayega
        req.userID = rootUser._id; 
        
        next();

    } catch (error) {
        res.status(401).send('not authorized')
        console.log(error)
    }
    
}



module.exports = authentications;