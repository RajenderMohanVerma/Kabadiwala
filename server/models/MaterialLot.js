import mongoose from 'mongoose'
const MaterialLotSchema = new mongoose.Schema({
  lotId:String, material:String, weight:Number, rate:Number, collector:String, status:String
},{timestamps:true})
export default mongoose.model('MaterialLot',MaterialLotSchema)
