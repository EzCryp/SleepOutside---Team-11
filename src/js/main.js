import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

// Simple, one-time initialization
document.addEventListener('DOMContentLoaded', initHomepage);

async function initHomepage() {
  // Prevent multiple calls
  if (document.body.classList.contains('homepage-loaded')) {
    return;
  }
  document.body.classList.add('homepage-loaded');
  
  try {
    console.log('Initializing homepage...');
    await loadHeaderFooter();
      // Defensive: if the page was duplicated in the DOM (preview frames, injected scripts),
      // remove duplicate main sections and keep the first occurrence to avoid visual repeats.
      removeDuplicateSections(['.hero', '.categories', '.products']);
    await loadFeaturedProducts();
    console.log('Homepage initialized successfully');
  } catch (error) {
    console.error('Error during homepage initialization:', error);
    document.body.classList.remove('homepage-loaded'); // Reset on error
  }
}

// Load and display featured products on homepage
async function loadFeaturedProducts() {
  // Prevent multiple calls to this function
  if (loadFeaturedProducts.hasRun) {
    console.log('Featured products already loaded, skipping...');
    return;
  }
  loadFeaturedProducts.hasRun = true;
  
  try {
    // Clear any existing content first and verify element exists
    const productListElement = document.querySelector(".product-list");
    if (!productListElement) {
      console.error('Product list element not found');
      return;
    }
    
    // Completely clear the container
    productListElement.innerHTML = '';
    
    // Try local JSON first for reliability
    let products;
    try {
      const response = await fetch('./json/tents.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      products = await response.json();
      console.log('Loaded products from local JSON:', products.length);
    } catch (error) {
      console.warn('Local JSON failed, trying API...', error);
      // Fallback to API
      const dataSource = new ExternalServices();
      products = await dataSource.getData('tents');
    }
    
    // Filter to only show featured products
    const featuredProductIds = ['985PR', '880RT', '880RR', '344YJ'];
    const featuredProducts = products.filter(product => 
      featuredProductIds.includes(product.Id)
    );
    
    // Sort to maintain the order we want to display them
    const sortedProducts = featuredProductIds.map(id => 
      featuredProducts.find(product => product.Id === id)
    ).filter(product => product !== undefined);
    
    console.log('Rendering featured products:', sortedProducts.length);
    renderFeaturedProducts(sortedProducts);
  } catch (error) {
    console.error('Error loading featured products:', error);
    loadFeaturedProducts.hasRun = false; // Reset on error
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

// Remove duplicate elements for the selectors provided, keeping the first occurrence only.
function removeDuplicateSections(selectors = []) {
  try {
    selectors.forEach(selector => {
      const nodes = Array.from(document.querySelectorAll(selector));
      if (nodes.length > 1) {
        console.warn(`Found ${nodes.length} '${selector}' elements — removing duplicates.`);
        // keep the first, remove the rest
        nodes.slice(1).forEach(n => n.remove());
      }
    });
  } catch (err) {
    console.error('Error removing duplicate sections:', err);
  }
}