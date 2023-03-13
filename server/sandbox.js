/* eslint-disable no-console, no-process-exit */
const montlimartbrand = require('./eshops/montlimartbrand');

/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./eshops/dedicatedbrand');

/* eslint-disable no-console, no-process-exit */
const circlesportswearbrand = require('./eshops/circlesportswearbrand');

//'https://www.dedicatedbrand.com/en/men/news'
//'https://www.dedicatedbrand.com/en/men/all-men'

//'https://www.montlimart.com/99-vetements'

//'https://shop.circlesportswear.com/collections/collection-homme'

async function sandbox (eshop = 'https://shop.circlesportswear.com/collections/collection-homme') {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} eshop`);

    //const products = await dedicatedbrand.scrape(eshop);
    //const products = await montlimartbrand.scrapeAndSave(eshop, 'montlimart.json');
    const products = await circlesportswearbrand.scrapeAndSave(eshop, 'circlesportswear.json');
    //const products = await dedicatedbrand.getProducts();

    //console.log(JSON.stringify(Object.assign({}, products)));

    /*const { writeFileSync } = require('fs');

    writeFileSync('./dedicated.json', JSON.stringify(Object.assign({}, products)), (error) => {
    if (error) {
      console.log('An error has occurred ', error);
      return;
    }
      console.log('Data written successfully to disk');
    });*/

    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
