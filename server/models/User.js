import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
  name:{type:String,required:true}, email:{type:String,unique:true}, password:{type:String}, role:{type:String,enum:['household','collector','recycler','admin']},
  phone:String, address:String, trustScore:{type:Number,default:70}, rating:{type:Number,default:5}
},{timestamps:true})
export default mongoose.model('User',UserSchema)
