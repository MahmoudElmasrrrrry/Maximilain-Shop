const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title:{
    type: String,
    required:true,
  },
  price:{
    type:Number,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  imageUrl:{
    type:String,
    required:true,
  },
  userId:{
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

module.exports = mongoose.model('Product', productSchema);

// const mongodb = require('mongodb');
// const { getDb } = require('../util/database');
// class Product{
//   constructor(title, price, imageUrl, description, id, userId){
//     this.title = title;
//     this.price = price;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save(){
//     const db = getDb();
//     const products = db.collection('products');
//     let dpOperation
//     if(this._id){
//       dpOperation = products.updateOne({_id: this._id}, {$set: this});
//     }else{
//       dpOperation = products.insertOne(this);
//     }
//     return dpOperation
//     .then(result => {
//       console.log(result);
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   }

//   static fetchAll(){
//     const db = getDb();
//     const products = db.collection('products');
//     return products.find().toArray()
//     .then(products => {
//       console.log(products);
//       return products;
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   }

//   static findById(id){
//     const db = getDb();
//     const products = db.collection('products');
//     return products.find({_id: new mongodb.ObjectId(id)}).next()
//     .then(product => {
//       console.log(product);
//       return product;
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   }

//   static deleteById(id){
//     const db = getDb();
//     const products = db.collection('products');
//     return products.deleteOne({_id: new mongodb.ObjectId(id)})
//     .then(result => {
//       console.log(result);
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   }
  
// }

// module.exports = Product;