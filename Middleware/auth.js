const ErrorHandler = require('../Utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors')
const jwt = require('jsonwebtoken')
const User = require('../Models/userModel')

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next)=>{


    const {token} = req.cookies;
    
    console.log(token)

    if(! token ){
     
        return next( new ErrorHandler("Please Login to acces the resource" , 401))

    }

    const decodedData = jwt.verify(token , process.env.JWT_SECRET)

     console.log("in auth block")
     //console.log(req)

     req.user = await User.findById(decodedData.id) // current user value is stores in req.user and further this value is used to 
                                                    // see who created updated or deleated the product

     next()
})

exports.authorizedRoles =   (...roles) =>{

     return (req , res , next )=>{

            if(!roles.includes(req.user.role)){

                 return next( new ErrorHandler(`Role:${req.user.role} is not allowed to access this resource`, 403))

            }

            next()

      }

}