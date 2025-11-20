import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";

loadHeaderFooter();

// Load and display featured products on homepage
async function loadFeaturedProducts() {
  try {
    const response = await fetch('/json/tents.json');
    const products = await response.json();
    
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
  }
}

function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="/product_pages/index.html?product=${product.Id}">
        <img src="${product.Image}" alt="${product.NameWithoutBrand}">
        <h3 class="card__brand">${product.Brand.Name}</h3>
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