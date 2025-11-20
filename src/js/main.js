import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

loadHeaderFooter();

// Load and display featured products on homepage
async function loadFeaturedProducts() {
  try {
    // Use the API instead of local JSON files
    const dataSource = new ExternalServices();
    const products = await dataSource.getData('tents');
    
    // Filter to only show products we have detail pages for
    const featuredProductIds = ['880RR', '985RF', '985PR', '344YJ'];
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
    // Fallback to local JSON if API fails
    try {
      const response = await fetch('./json/tents.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      
      const featuredProductIds = ['880RR', '985RF', '985PR', '344YJ'];
      const featuredProducts = products.filter(product => 
        featuredProductIds.includes(product.Id)
      );
      
      const sortedProducts = featuredProductIds.map(id => 
        featuredProducts.find(product => product.Id === id)
      ).filter(product => product !== undefined);
      
      renderFeaturedProducts(sortedProducts);
    } catch (fallbackError) {
      console.error('Both API and fallback failed:', fallbackError);
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

// Load featured products when page loads
loadFeaturedProducts();