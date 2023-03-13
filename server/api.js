const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

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

app.get('/products', (request, response) => {
  response.send({ 'ack': true });
});

app.listen(PORT, () => {
  console.log(`📡 Running on port ${PORT}`);
});

/*app.get("/products/:id", (request, response) => {
  collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });*/

app.get('/products/search', (request, response) => {
  const { limit = 12, brand = 'All_brands', price = 1000 } = request.query;
  const query = {
    "brand": brand !== "All_brands" ? brand : { $exists: true }, // Filter by brand if specified, otherwise return all brands
    "price": { $lte: parseFloat(price)} // Filter by price if specified, otherwise return all prices
  };
  collection.find(query).sort({price : -1}).limit(parseInt(limit)).toArray((err, result) => {
    if (err) throw err;
    response.send(result);
  });
});