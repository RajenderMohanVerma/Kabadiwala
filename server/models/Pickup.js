import mongoose from 'mongoose'
const PickupSchema = new mongoose.Schema({
  householdId:String, collectorId:String, material:String, weight:Number, rate:Number, amount:Number,
  address:String, slot:String, status:{type:String,enum:['requested','accepted','picked_up','completed'],default:'requested'}
},{timestamps:true})
export default mongoose.model('Pickup',PickupSchema)
