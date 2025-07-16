const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config()
const mongourl=process.env.MONGO_URL
mongoose.connect(mongourl).then(()=>{
    console.log("database connected successsfully")
})
const userschema=new mongoose.Schema({
    email:String,
    item:String,
    quantity:Number,
    orderedAt: { type: Date, default: Date.now } 
})
const usersmodels=mongoose.model("orders",userschema)
module.exports=usersmodels