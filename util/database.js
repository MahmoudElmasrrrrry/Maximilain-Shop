const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (cb)=>{
  mongoClient.connect('mongodb://localhost:27017/Shop')
  .then(client => {
    console.log('Connected!');
    _db = client.db();
    cb();
  })
  .catch(err => {
    console.log(err);
  });
}

const getDb = ()=>{
  if(_db){
    return _db;
  }
  throw new Error('No database found!');
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;