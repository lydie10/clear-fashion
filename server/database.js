const { MongoClient, ServerApiVersion } = require('mongodb');
const products1 = require('./dedicated.json');
const products2 = require('./montlimart.json');
const products3 = require('./circlesportswear.json');

const products = products1.concat(products2,products3);

const MONGODB_URI = "mongodb+srv://lydiepont:dtff83yRKKeqVc7j@cluster0.gybdxgn.mongodb.net/?retryWrites=true&w=majority";
const MONGODB_DB_NAME = 'clearfashion';

async function run() {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection('products');

    const result = await collection.insertMany(products, {upsert: true});
    console.log(result);

    //find all products related to a given brand
    brand = 'montlimart'
    const filterBrand = await collection.find({brand}).toArray();
    //console.log(filterBrand);

    //Filter by price
    const price =50;
    const filterPrice = await collection.find({"price":{$lt: price}}).toArray();
    //console.log(filterPrice);

    //Order by price
    const orderPrice = await collection.aggregate([{$sort:{price : -1 }}]).toArray();
    //console.log(orderPrice);

    //Order by date
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - (14 *24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
    const orderDate = await collection.find({"date":{$gt: twoWeeksAgo}}).toArray();
    //console.log(orderDate);

  } catch (e) {
    console.error(e);
  } finally {
    client.close();
  }
}

run();