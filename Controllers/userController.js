const ErrorHandler = require('../Utils/errorHandler')
const catchAsyncErrors = require('../Middleware/catchAsyncErrors')
const User = require('../Models/userModel')
const Product = require('../Models/productModel')
const sendToken = require('../Utils/jwttoken')
const sendEmail = require('../Utils/sendEmail.js')
const crypto = require('crypto')

// Regitering a user/////////////////////////////////////////////

exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body

    const user = await User.create({

        name, email, password,

        avtar: {

            public_id: "this is a sample id",
            url: "profile pic url"
        }

    })

    sendToken(user, 201, res)
})


////Login a user////////////////////////////////////////////////

exports.loginUser = catchAsyncErrors(async (req, res, next) => {


    const { email, password } = req.body


    // checking if user has given email and password both

    if (!email || !password) {

        return next(new ErrorHandler("Please enter email and password", 400))

    }

    const user = await User.findOne({ email }).select("+password");
    console.log("user below")
    console.log(user)

    if (!user) {

        return next(new ErrorHandler("Invalid email or password", 401))
    }

    const isPasswordMatched = await user.comparePassword(password) // i added await here please dont remove it

    if (!isPasswordMatched) {

        return next(new ErrorHandler("Invalid email or password", 401))
    }

    // external created module used to create jwt and storing it in cookie

    sendToken(user, 200, res)

})

/////////////Log out method/////////////////////////////////

exports.logout = catchAsyncErrors(async (req, res, next) => {


    res.cookie('token', null, {

        expires: new Date(Date.now()),
        httpOnly: true

    })


    res.status(200).json({

        success: true,
        message: "Logged out successfully"
    })


})


///////////Forgot password///////////////////////////////////////

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email })

    if (!user) {

        return next(new ErrorHandler("User not found", 404))
    }

    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false }) // saving user with temporary token password

    const resetPasswordUrl = `http://localhost/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} if you have not requested this link please ignore it`

    try {

        await sendEmail({

            email: user.email,
            subject: "Ecommerce password reset",
            message

        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })

    }

    catch (error) {

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }

})


// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    // creating token hash for finding the particular user who wants to change password in database
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')


    const user = await User.findOne({

        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {

        return next(new ErrorHandler("Reset password token is invalid or has been expired", 400))
    }

    if (req.body.password !== req.body.confirmPassword) {

        return next(new ErrorHandler("Passwords does not match", 400))

    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)

})

// get user details

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {


    const user = await User.findById(req.user.id)

    res.status(200).json({

        success: true,
        user

    })

})

// Update user password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")


    const isPasswordMatched = await user.comparePassword(req.body.oldPassword) // i added await here please dont remove it

    if (!isPasswordMatched) {

        return next(new ErrorHandler("Old password is incorrect", 400))
    }

    if (req.body.newPassword !== req.body.confirmPassword) {

        return next(new ErrorHandler("Password does not match", 400))
    }

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)


})


//Update user profile

exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {

    const newUserData = {

        name: req.body.name,
        email: req.body.email
    }

    // will add cloudinary later
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {

        runValidators: true,
        new: true,
        useFindAndModify: false

    })



    res.status(200).json({

        success: true


    })
})

// get all users(for admin)

exports.getAllUsers = catchAsyncErrors( async(req,res,next)=>{


    const users = await User.find()

    res.status(200).json({

        success:true,
        users

    })

})

// get single user details (for admin only)

exports.getParticularUserDetails = catchAsyncErrors( async(req,res,next)=>{


    const user = await User.findById(req.params.id)

    if(!user){

        return next(new ErrorHandler(`User does not exsist with Id ${req.params.id}`))
    }

    res.status(200).json({

        success:true,
        user

    })

})


// update user role (for admin only)


exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {

    const newUserData = {

        name: req.body.name,
        email: req.body.email,
        role:req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {

        runValidators: true,
        new: true,
        useFindAndModify: false

    })



    res.status(200).json({

        success: true,
        message:"User Role Updated"


    })
})

//deleting a user -->(Admin only)

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

    
   const user = await User.findById(req.params.id)

   if(!user){

      return next( new ErrorHandler(`User does not exsist eith id ${req.params.id}`))
   }


   await user.remove()

    res.status(200).json({

        success: true,
        message:"User deleted"


    })
})

// creating product review// understand it carefully

exports.createProductReview = catchAsyncErrors ( async(req,res,next)=>{


    const { rating,comment,productId } = req.body

    const review = {

        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment

    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(rev => rev.user.toString()===req.user._id.toString())

    if(isReviewed){

        product.reviews.forEach( rev =>{

               if(rev.user.toString() === req.user._id.toString()){
                    
                   rev.rating = rating,
                   rev.comment = comment

               }

        })

    }

    else{

        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }


    let avg = 0
    
     product.reviews.forEach((rev)=>{

           avg = avg+rev.rating

    })
    console.log(avg)
    product.rating = avg/product.reviews.length


    await product.save({validateBeforeSave:false})

    res.status(200).json({

        success:true
    })

})


// Get product reviews of a single product

exports.getProductReviews = catchAsyncErrors( async (req, res,next) =>{

const product_Id = req.query.id

const product = await Product.findById(product_Id)

if(!product){

    return next(new ErrorHandler("Product Not Found", 404))
}

res.status(200).json({

    success:true,
    reviews:product.reviews

})

})

// Deleting a review

exports.deleteReview = catchAsyncErrors( async(req,res,next)=>{


    const product = await Product.findById(req.query.productId)// product id

    if(!product){

        return  next( new ErrorHandler("Product Not Found" , 404))
    }

    const reviews = product.reviews.filter((rev)=>{

         return rev._id.toString() !== req.query.reviewId.toString()

    })


    let avg = 0
    
     reviews.forEach((rev)=>{

           avg = avg+rev.rating

    })
    console.log(avg)
    
    const  rating = avg/reviews.length

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId ,{
        
            reviews,
            rating, 
            numOfReviews,
        
        },{
         
            new:true,
            runValidators:true,
            useFindAndModify:false,
        })

        res.status(200).json({
         
            success:true,
            message:"Review deleted"

        })

})