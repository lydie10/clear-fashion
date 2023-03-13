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

  return $('.product-grid-container .grid__item')
    .map((i, element) => {
        const brand = 'circlesportswear';
        const name = $(element)
        .find('.card__heading')
        .text()
        .split(' ')
        .filter(function(value, index, self) { 
            return self.indexOf(value) === index;
        }).join(' ')
        .trim()
        .replace(/\s/g, ' ');
      const price =parseFloat($(element)
          .find('.price__regular .price-item--regular')
          .text()
          .trim()
          .replace(/\s/g, ' ')
          .replace('€', ''));
      const link ='https://shop.circlesportswear.com/'+ $(element)
          .find('.full-unstyled-link').attr('href');


          const image = $(element)
          .find('.motion-reduce')
          .attr('srcset').split(',')[0];
      let date = new Date().toISOString().slice(0, 10);
        return {brand,name, price,link,image,date};
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
/**
   * Scrape all the products for a given url page and save as a JSON file
   * @param  {string}  url
   * @param  {string}  filename
   * @return {Promise<boolean>} - true if successful, false otherwise
   * 
   */module.exports.scrapeAndSave = async (url, filename) => {
    try {
      const response = await fetch(url);
  
      if (response.ok) {
        const body = await response.text();
  
        const data = parse(body);
  
        // Write the data to a JSON file
        fs.writeFileSync(filename, JSON.stringify( data,null , 2));
  
        return true;
      }
  
      console.error(response);
  
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };  