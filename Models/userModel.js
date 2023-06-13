const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({

    name: {

        type: String,
        required: [true, "Please enter your name"],
        maxlength: [30, "Name cannot exceed 30 characters"],
        minlength: [4, "Name should have more than 4 characters"]

    },

    email: {

        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email address"]

    },

    password: {

        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "Password should be greater than 8 characters"],
        select: false, // this will give every information about user in database except password
    },

    avtar: {

        public_id: {

            type: String,
            required: true
        },

        url: {

            type: String,
            required: true

        }

    },

    role: {

        type: String,
        default: "user"

    },

   resetPasswordToken:String,
   resetPasswordExpire: Date

})


// below code is for encrypting password and checking wether password is modufied or not
userSchema.pre("save" ,  async function(next){

    if(!this.isModified('password')){

          next()
    }

    this.password = await bcrypt.hash(this.password , 10)

})


// JWT /////////////Note--> we cannot use this in arrow function////

userSchema.methods.getJWTToken = function(){

   return jwt.sign({id:this._id} , process.env.JWT_SECRET , {
 
       expiresIn: process.env.JWT_EXPIRE

   })

}

// compare password

userSchema.methods.comparePassword = async function(enteredPassword){

    console.log("in compare password , user password from database below")
    console.log(this.password)
    console.log("entered password below")
    console.log(enteredPassword)

    console.log("password match test below")
    
    var a = await bcrypt.compare(enteredPassword, this.password)
    console.log(a)

    return   await bcrypt.compare(enteredPassword, this.password)

    
}

// generatinf password reset token

userSchema.methods.getResetPasswordToken = function(){

   //generatinf token 
    
    const resetToken = crypto.randomBytes(20).toString('hex')

    // hashing and adding to user Schema

    this.resetPasswordToken = crypto
                                    .createHash('sha256')
                                    .update(resetToken)
                                    .digest('hex')

    this.resetPasswordExpire = Date.now() + 15*60*1000                                

    return resetToken  
}
 

module.exports = mongoose.model("User" , userSchema)