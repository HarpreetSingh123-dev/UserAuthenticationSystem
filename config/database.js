const mongoose = require('mongoose')



const connectDatabase = () =>{

    mongoose.connect( `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@cluster0.tkab1.mongodb.net/?retryWrites=true&w=majority` , {useNewUrlParser:true , useUnifiedTopology:true }).then((data)=>{

        console.log(`Mongo Db Connected with server ${data.connection.host}`)
    
    })

}

module.exports = connectDatabase