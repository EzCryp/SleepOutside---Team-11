import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

// Ensure we only load once
let isLoaded = false;

// Load header and footer first, then load products
document.addEventListener('DOMContentLoaded', async () => {
  if (isLoaded) return;
  isLoaded = true;
  
  try {
    console.log('Initializing homepage...');
    await loadHeaderFooter();
    await loadFeaturedProducts();
    console.log('Homepage initialized successfully');
  } catch (error) {
    console.error('Error during homepage initialization:', error);
  }
});

// Load and display featured products on homepage
async function loadFeaturedProducts() {
  try {
    // Clear any existing content first
    const productListElement = document.querySelector(".product-list");
    if (!productListElement) {
      console.error('Product list element not found');
      return;
    }
    
    productListElement.innerHTML = '';
    // Try API first, fall back to local JSON
    let products;
    try {
      const dataSource = new ExternalServices();
      products = await dataSource.getData('tents');
    } catch (error) {
      console.warn('API failed, using local JSON:', error);
      // Direct fallback to local JSON
      const response = await fetch('./json/tents.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      products = await response.json();
    }
    
    // Filter to only show products we have detail pages for - matching reference design
    const featuredProductIds = ['985PR', '880RT', '880RR', '344YJ'];
    const featuredProducts = products.filter(product => 
      featuredProductIds.includes(product.Id)
    );
    
    // Sort to maintain the order we want to display them
    const sortedProducts = featuredProductIds.map(id => 
      featuredProducts.find(product => product.Id === id)
    ).filter(product => product !== undefined);
    
    renderFeaturedProducts(sortedProducts);
  } catch (error) {
    console.error('Error loading featured products:', error);
    // Show error message to user
    const productList = document.querySelector('.product-list');
    if (productList) {
      productList.innerHTML = '<li>Error loading products. Please try again later.</li>';
    }
  }
}

function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="./product_pages/index.html?product=${product.Id}">
        <img src="${product.Images?.PrimaryMedium || product.Image}" alt="${product.NameWithoutBrand}">
        <h3 class="card__brand">${product.Brand?.Name || product.Brand}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <p class="product-card__price">$${product.FinalPrice}</p>
      </a>
    </li>
  `;
}

function renderFeaturedProducts(products) {
  const productList = document.querySelector('.product-list');
  if (productList) {
    renderListWithTemplate(productCardTemplate, productList, products, "afterbegin", true);
  }
}