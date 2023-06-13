const app = require("./app")
const dotenv = require('dotenv')
const connectDatabase = require('./config/database')

//Handling uncaught exception

process.on("uncaughtException" , (err)=>{

     console.log(`Error: ${err.message}`)
     console.log("Shutting down the server due to unhandled exception") 

   
     process.exit(1)
 
})


//Config path

dotenv.config({path:'config/config.env'})

// Connecting database

connectDatabase()


const server = app.listen(process.env.PORT , ()=>{

  console.log(`Server is running on port${process.env.PORT}`)

})


// unhandled rejection error handling

process.on("unhandledRejection" , (err)=>{

            console.log(`Error: ${err.message}`)
            console.log("Shutting down the server due to unhandled promise rejection") 

           server.close(()=>{
 
               process.exit(1)
           }) 

})