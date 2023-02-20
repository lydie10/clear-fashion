const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('.productList-container .productList')
    .map((i, element) => {
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.productList-price')
          .text()
      );
      const link ='https://www.dedicatedbrand.com'+ $(element)
        .find('.productList-link').attr('href');
      
      const image =
       $(element)
       .find('.js-lazy')
       .attr('data-src')

      let date = new Date().toISOString().slice(0, 10);
      
      return {name,link,image,price, date};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.getProducts= async() =>{

  try{ 
    const response = await fetch ("https://www.dedicatedbrand.com/en/loadfilter");
    if (response.ok){
      const body =await response.json();
      const products = body['products'].filter(
        data => Object.keys(data).length >0
      );
      //console.log(products);
      data_json =products.map(
        function(data){
          const image= data['image'][0];
          const link = "https://www.dedicatedbrand.com/en/"+ data['canonicalUri'];
          const name =data['name'];
          const price =data['price']['priceAsNumber'];
          const date =new Date().toDateString();
          return{name, link, image, price, date};
        }
      );
       // Write the data to a JSON file
       fs.writeFileSync('dedicated.json', JSON.stringify(data_json,null , 2));

       return true;
    }
    console.error(response);
    return null;
  } catch(error){
    console.error(error);
    return null;
  }
}
