const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const {MongoClient, ObjectId} = require('mongodb');

const MONGODB_URI = "mongodb+srv://lydiepont:dtff83yRKKeqVc7j@cluster0.gybdxgn.mongodb.net/?retryWrites=true&w=majority";
const MONGODB_DB_NAME = 'clearfashion'
const PORT = 8092;

const app = express();
module.exports = app;
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

let database, collection;

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    throw error;
  }
  database = client.db(MONGODB_DB_NAME);
  collection = database.collection('products');
  console.log(`Connected to '${MONGODB_DB_NAME}'!`);
});

app.options('*', cors());

app.get('/products', async (request, response) => {
  try{
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME)
    const collection = db.collection('products');
    const result = await collection.find({}).toArray();
    response.send({result : result});
    client.close();
  } catch(e){
    response.send({error : "could not retrieve products"});  
  }
});

app.get('/brands', async (request, response) => {
  try{
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME)
    const collection = db.collection('products');
    const result = await collection.distinct('brand');
    response.send({result : result});
    client.close();
  } catch(e){
    response.send({error : "could not retrieve brands"});  
  }
});

app.listen(PORT, () => {
  console.log(`📡 Running on port ${PORT}`);
});

/*app.get('/products/:id/', async(request, response) => {
  try{
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME)
    const collection = db.collection('products');
    const result = await collection.findOne({_id: ObjectId(request.params.id)});
    response.send({result : result});
    client.close();
  } catch(e){
    response.send({error : "invalid id"});  
  }
});*/

app.get('/products/search', async (request, response) => {
  try{
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME)
    const collection = db.collection('products');
    const { limit = 12, brand = 'All_brands', price = 1000 } = request.query;
    const query = {
      "brand": brand !== "All_brands" ? brand : { $exists: true }, // Filter by brand if specified, otherwise return all brands
      "price": { $lte: parseFloat(price)} // Filter by price if specified, otherwise return all prices
    };
    const searchresult = await collection.find(query).sort({price : -1}).limit(parseInt(limit)).toArray();
    response.send({result : searchresult});
    client.close();
  } catch(e){
    response.send({error : "invalid search"});  
  }
});