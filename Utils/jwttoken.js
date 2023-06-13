// creating token and saving in cookie

const sendToken = ( user , statusCode , res) =>{

    const token =   user.getJWTToken()

    // option for cookie

    const options ={
        expires:new Date( Date.now() + process.env.COOKIE_EXPIRE * 24*60*60*1000),
        httpOnly:true,
        
    }

    //const a = res.cookie('token' , token , options)
    //console.log("cookie below")
    //console.log(a)

    res.status(statusCode).cookie('token' , token , options).json({

        success:true , 
        user , 
        token,
        
     })
    
    //('token', token , options).json({
        
    //    success:true , 
      //  user , 
        //token})

}

module.exports = sendToken