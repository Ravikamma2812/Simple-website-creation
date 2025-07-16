const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config()
const mongooseurl=process.env.MONGO_URL
mongoose.connect(mongooseurl).then(()=>{
    console.log("database connected successsfully")
})
const userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
})
const usermodel=mongoose.model("samples",userschema)
module.exports=usermodel