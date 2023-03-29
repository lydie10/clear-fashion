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
let onlyRecentProducts = [];
let onlyReasonablePrice = [];

// favorite products
let favoriteProducts = [];
let favoritesList = JSON.parse(localStorage.getItem("favoriteProducts")) || [];

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
const selectFavorite = document.querySelector('#favorite-select');

const spanNbProducts = document.querySelector('#nbProducts');
const spanNbBrands = document.querySelector('#nbBrands');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
const spanLatestRelease = document.querySelector('#latestRelease');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = (result) => {
  currentProducts = result;     
};

/**
 * Fetch products from api
 * @param  {Number}  [nbProducts=30] - number of products to fetch
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */

const fetchProducts = async (nbProducts = 30, page = 1, size = 12) => { 
  if (nbProducts === 'All'){
  try {
    const response = await fetch(
      `https://server-neon-alpha.vercel.app/products/search?limit=3000`
    );
    const body = await response.json();
  
    if (body.result !== null) {
      return body.result;
    }
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
}else {
  try {
    const response = await fetch(
      `https://server-neon-alpha.vercel.app/products/search?limit=${nbProducts}`
    );
    const body = await response.json();
  
    if (body.result !== null) {
      return body.result;
    }
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
}
};

/**
 * Fetch brands from api
 * @return {Object}
 */

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://server-neon-alpha.vercel.app/brands`
    );
    const body = await response.json();

    if (body.result !== null) {
      if(!body.result.includes('All'))
        {body.result.unshift('All')}
      return body.result;
    }
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
  const backgroundColors = ['#fedcd2', '#bfd8d2', '#f6e291dd', '#d9afca'];
  const template = products
    .map((product, index) => {
      const backgroundColor = backgroundColors[index % backgroundColors.length];
      const gradientColor = `${backgroundColor},rgba(255, 255, 255, 0.5)`;
      return `
        <div class="product" id=${product._id} style="background: linear-gradient(135deg, ${gradientColor});">
          <a href="${product.link}" target="_blank">
            <span class="product-name">${product.name}</span>
            <img src=${product.image} class="image">
            <div class="details">
              <span class="brand-name">${product.brand}</span>
              <span>${product.price}€</span>
              <label class="add-fav">
                Add to favorites <input id=${product._id} type="checkbox" onchange="manageFavorites(this)" ${favoritesList.some(p => p._id === product._id) ? 'checked' : ''}/>
                <i class="heart">&#10084;</i>
              </label>
            </div>
          </a>
        </div>
      `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML='<h2>Products</h2>';
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
 * Render indicators
 * @param  {Object} products
 * * @param  {Object} brands
 */
const renderIndicators = (products,brands) => {
  
  spanNbProducts.innerHTML = products.length;
  spanNbBrands.innerHTML = brands.length -1;
  spanNbNewProducts.innerHTML = onlyRecentProducts.length;

  let sortedProducts = sortByDateRecentToOld(products);
  spanLatestRelease.innerHTML = sortedProducts[0].date;
};

const renderPValues = (p50, p90, p95) => {
  spanP50.innerHTML = p50;
  spanP90.innerHTML = p90;
  spanP95.innerHTML = p95;
}


/**
 * Render brands selector
 *  @param  {Object} brands
 */
const renderBrands = brands => {
  const options = Array.from(brands).map(brand => `<option value="${brand}">${brand}</option>`
  ).join('');
  
  selectBrand.innerHTML = options;
};

const render = (products, brands) => {
  renderProducts(products);
  //renderPagination(pagination);
  renderIndicators(products,brands);
  renderBrands(brands);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value));

  setCurrentProducts(products);
  renderProducts(currentProducts);
});

/**
 * Filter by brand 
 */

selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts('All');
  
  setCurrentProducts(products);
  let selectedBrand = event.target.value;
  let currentBrand = {};
  currentBrand[selectedBrand] = [];

  if (selectedBrand === 'All'){
    renderProducts(products)
  }
  else{
  for (const product of currentProducts) {
    if (product.brand == selectedBrand) {
    currentBrand[product.brand].push(product)
    }
  };
  renderProducts(currentBrand[selectedBrand]);
}
});

/**
 * By recently date
 */
selectRecent.addEventListener('change', async (event) => {
  const products = await fetchProducts('All');

  setCurrentProducts(products);

  if(event.target.value == "Yes"){
    recentDate(currentProducts,onlyRecentProducts);
    renderProducts(onlyRecentProducts);
  }
  else {
    const products = await fetchProducts();
    setCurrentProducts(products);
    renderProducts(currentProducts);
  }
});

/**
 * By reasonable price
 */
selectReasonablePrice.addEventListener('change', async (event) => {
  const products = await fetchProducts('All');

  setCurrentProducts(products);

  if(event.target.value == "Yes"){
    for (let i = 0; i<currentProducts.length; i++) {
      if (currentProducts[i].price <50) {
      onlyReasonablePrice.push(currentProducts[i]);
    }
  };
}
else {
  renderProducts(currentProducts);
}
  renderProducts(onlyReasonablePrice);
});


/**
 * By favorite products
 */
selectFavorite.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  setCurrentProducts(products);

  if(event.target.value == "Yes"){
    let favoritesList = JSON.parse(localStorage.getItem("favoriteProducts"));
  
    renderProducts(favoritesList);
}
else {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  setCurrentProducts(products);
  renderProducts(currentProducts);
  }
});

/**
 * Filter by date and by price 
 */

selectSort.addEventListener('change', async (event) => {
  const products = await fetchProducts('All');

  setCurrentProducts(products);

  let sortedProducts = {};

  if (event.target.value == "price-desc"){
    sortedProducts = sortByPriceHighToLow(currentProducts);
  }
  else if (event.target.value == "price-asc"){
    sortedProducts = sortByPrice(currentProducts);
  }
  else if (event.target.value == "date-desc"){
    sortedProducts = sortByDateOldToRecent(currentProducts);
  }
  else if (event.target.value == "date-asc"){
    sortedProducts = sortByDateRecentToOld(currentProducts);
  }

  renderProducts(sortedProducts);
});

/**
 * Select Page
 */
selectPage.addEventListener('change', async (event) => {

  if (parseInt(event.target.value) !== 1){
    const products = await fetchProducts(parseInt(event.target.value)*200);
    setCurrentProducts(products);
    renderProducts(products);
    const position = Math.round((parseInt(event.target.value)-1)/(parseInt(event.target.value)) * document.body.scrollHeight);
    window.scrollTo({
      top: position,
      behavior: 'smooth'
    });
  }
  else {
    const products = await fetchProducts();
    setCurrentProducts(products);
    renderProducts(products);
  }
});


/**
 * Load Page
 */

document.addEventListener('DOMContentLoaded', async () => {
  let products = await fetchProducts('All');
  const brands = await fetchBrands();

  console.log("brands", brands);
  console.log("products", products);
  setCurrentProducts(products);

  let [p50, p90, p95] = getPValueIndicator(currentProducts);
  renderPValues(p50, p90, p95);
  renderIndicators(products,brands);

  products = await fetchProducts();
  setCurrentProducts(products);
  renderProducts(products);
  renderBrands(brands);

  localStorage.setItem('favoriteProducts',JSON.stringify(favoriteProducts));
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
  if (a.date > b.date) {
    return -1;
  }
});
return sorted;
};

function sortByDateOldToRecent(data) {
  const sorted = data.sort((a, b) => {
    if (a.date < b.date) {
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

function recentDate(currentProducts, onlyRecentProducts) {
  let twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
   twoWeeksAgo = formatDate(twoWeeksAgo);
  

   for (let i = 0; i<currentProducts.length; i++) {
    if (currentProducts[i].date > twoWeeksAgo) {
     onlyRecentProducts.push(currentProducts[i]);
      }
    };
}

/**
 * P -value function
 */

function getPValueIndicator(currentProducts) {
    var index50th = Math.floor(currentProducts.length*0.5);
    var index90th = Math.floor(currentProducts.length*0.9);
    var index95th = Math.floor(currentProducts.length*0.95);
    let sortedCurrentProducts = sortByPrice(currentProducts);
  

    return ([sortedCurrentProducts[index50th].price,
            sortedCurrentProducts[index90th].price,
            sortedCurrentProducts[index95th].price])
 
  };

  /**
 * Add to favorite function
 */

  function manageFavorites(element) {
    
    if (!element.checked) {
      
      const index = favoritesList.findIndex((p) => p._id === element.id);
      if (index !== -1) {
        favoritesList.splice(index, 1);
      }
    } else {
      
      const product = currentProducts.find((p) => p._id === element.id);
      if (product && !favoritesList.some((p) => p._id === element.id)) {
        favoritesList.push(product);
      }
    }
  
    localStorage.setItem("favoriteProducts", JSON.stringify(favoritesList));
  }
  