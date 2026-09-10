import mongoose from 'mongoose'
const TransactionSchema = new mongoose.Schema({
  transactionId:String, pickupId:String, collectorId:String, householdId:String,
  material:String, weight:Number, rate:Number, amount:Number, paymentMode:String
},{timestamps:true})
export default mongoose.model('Transaction',TransactionSchema)
