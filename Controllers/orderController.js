const Order = require('../Models/orderModel')
const Product = require('../Models/productModel')
const ErrorHandler = require('../Utils/errorHandler')
const catchAsyncErrors = require('../Middleware/catchAsyncErrors')

exports.newOrder = catchAsyncErrors( async (req,res,next)=>{


     const {shippingInfo , 
            orderItems , 
            paymentInfo , 
            itemsPrice , 
            taxPrice , 
            shippingPrice , 
            totalPrice 
           } = req.body
console.log("user below")
console.log(req.user._id)
     const order = await Order.create({

        shippingInfo , 
        orderItems , 
        paymentInfo , 
        itemsPrice , 
        taxPrice , 
        shippingPrice , 
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id  

         
     })      

     res.status(201).json({

        success:true,
        order,
        message:"order successfully created"
     })

     

})

// get single order details
exports.getSingleOrder = catchAsyncErrors( async(req,res,next)=>{

 const order = await Order.findById(req.params.id).populate("user" , "name email"); // this method will also return email and name from user collection

   if(!order){

       return next( new ErrorHandler("Order not found with this id", 404));

    }


   res.status(200).json({
      success:true,
      order
  })


})


// get logged in order details(user which is logged in)

exports.myOrders = catchAsyncErrors( async(req,res,next)=>{

    const orders = await Order.find({user : req.user._id})
   

      res.status(200).json({
         success:true,
         orders
     })
   
   
})

// get all orders --> Admin only
exports.getAllOrders = catchAsyncErrors( async(req,res,next)=>{

   const orders = await Order.find()
 
   let totalAmount = 0

   orders.forEach((order)=>{

      totalAmount += order.totalPrice

   })
  

     res.status(200).json({
        success:true,
        totalAmount,
        orders
    })
  
  
})

// update order status--> Admin only

exports.updateOrder = catchAsyncErrors( async(req,res,next)=>{


   const order = await Order.findById(req.params.id)

   if(!order){

      return next( new ErrorHandler("Order not found with this id", 404));

   }


   if(order.orderStatus === "Delivered"){

      return next(new ErrorHandler("You have already delivered this product", 400))

   }

   order.orderItems.forEach( async (order)=>{
   
      await updateStock(order.product , order.quantity)
   
   })

   order.orderStatus = req.body.status

   if(req.body.status === "Delivered"){

       order.deliveredAt = Date.now()

   }

   await order.save({validateBeforeSave: false})

   res.status(200).json({

      success:true
   })


})


async function updateStock(id, quantity){


   const product = await Product.findById(id)

   product.stock -= quantity

   await product.save({validateBeforeSave:false})

}



// deltinf order admin only

exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{


   const order = await Order.findById(req.params.id)

   if(!order){

      return next( new ErrorHandler("Order not found with this id", 404));

   }

   await order.remove()

   res.status(200).json({

      success:true
   })


})