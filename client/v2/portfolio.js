// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};

// brands on the page 
let brands = [];



// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const selectBrand = document.querySelector('#brand-select');
const selectSort = document.querySelector('#sort-select');
const selectReasonablePrice = document.querySelector('#reasonable-price-select');
const selectRecent = document.querySelector('#recent-select');

const spanNbProducts = document.querySelector('#nbProducts');
const spanNbBrands = document.querySelector('#nbBrands');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;      
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Fetch brands from api
 * @return {Object}
 */

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app/brands`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {brands};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {brands};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */

const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = (pagination,brands) => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
  spanNbBrands.innerHTML = brands.result.length;
  spanNbNewProducts.innerHTML = brands.result.length;
  spanP50.innerHTML = brands.result.length;
  spanP90.innerHTML = brands.result.length;
  spanP95.innerHTML = brands.result.length;
};


/**
 * Render brands selector
 */
const renderBrands = brands => {
  const options = brands.result.map(brand => `<option value="${brand}">${brand}</option>`
  ).join('');
  
  selectBrand.innerHTML = options;;
};

const render = (products, pagination,brands) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination,brands);
  renderBrands(brands);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/**
 * Filter by brand 
 */

selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, event.target.value);
  
  setCurrentProducts(products);

  let selectedBrand = event.target.value;
  let currentBrand = {};
  currentBrand[selectedBrand] = [];

  for (const product of currentProducts) {
    console.log(product);
    if (product.brand == selectedBrand) {
    currentBrand[product.brand].push(product)
    }
  };
  render(currentBrand[selectedBrand], currentPagination, brands);
});

/**
 * By recently released
 */
selectRecent.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  setCurrentProducts(products);

  let onlyRecentProducts = [];

  if(event.target.value == "Yes"){
    let twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    twoWeeksAgo = formatDate(twoWeeksAgo);
  

    for (let i = 0; i<currentProducts.length; i++) {
    if (currentProducts[i].released > twoWeeksAgo) {
      onlyRecentProducts.push(currentProducts[i]);
      }
    };
  }
  else {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
    setCurrentProducts(products);
    render(currentProducts, currentPagination, brands);
  }

  render(onlyRecentProducts, currentPagination, brands);
});

/**
 * By reasonable price
 */
selectReasonablePrice.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  setCurrentProducts(products);

  let onlyReasonablePrice = [];

  console.log(currentProducts);

  if(event.target.value == "Yes"){
  for (let i = 0; i<currentProducts.length; i++) {
  if (currentProducts[i].price <50) {
    onlyReasonablePrice.push(currentProducts[i]);
    }
  };
}
else {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
  setCurrentProducts(products);
  render(currentProducts, currentPagination, brands);
}

  render(onlyReasonablePrice, currentPagination, brands);
});

/**
 * Filter by date and by price 
 */

selectSort.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  setCurrentProducts(products);

  let sortedProducts = {};

  console.log(event.target.value);
  if (event.target.value == "price-desc"){
    sortedProducts = sortByPriceHighToLow(currentProducts);
    console.log(sortedProducts);
  }
  else if (event.target.value == "price-asc"){
    sortedProducts = sortByPrice(currentProducts);
    console.log(sortedProducts);
  }
  else if (event.target.value == "date-desc"){
    sortedProducts = sortByDateOldToRecent(currentProducts);
    console.log(sortedProducts);
  }
  else if (event.target.value == "date-asc"){
    sortedProducts = sortByDateRecentToOld(currentProducts);
    console.log(sortedProducts);
  }

  render(sortedProducts, currentPagination, brands);
});

/**
 * Select Page
 */
selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  const brands = await fetchBrands();

  console.log(brands);
  setCurrentProducts(products);
  render(currentProducts, currentPagination, brands);
});


/**
 * Sort functions
 */

function sortByPriceHighToLow(data) {
  const sorted = data.sort((a, b) => {
    if (a.price > b.price) {
      return -1;
    }
  });
  return sorted;
  };

function sortByPrice(data) {
   const sorted = data.sort((a, b) => {
    if (a.price < b.price) {
      return -1;
    }
  });
  return sorted;
  };


/**
 * Date functions
 */

function sortByDateRecentToOld(data) {
const sorted = data.sort((a, b) => {
  if (a.released > b.released) {
    return -1;
  }
});
return sorted;
};

function sortByDateOldToRecent(data) {
  const sorted = data.sort((a, b) => {
    if (a.released < b.released) {
      return -1;
    }
  });
  return sorted;
  };


function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}