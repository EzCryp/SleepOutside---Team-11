import { renderListWithTemplate } from "./utils.mjs";

// Get discount information for a product
function getDiscountInfo(product) {
  const isDiscounted = product.FinalPrice < product.SuggestedRetailPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100)
    : 0;
  return { isDiscounted, discountPercent };
}

function productCardTemplate(product) {
  const { isDiscounted, discountPercent } = getDiscountInfo(product);
  return `
    <li class="product-card">
      <a href="./product_pages/index.html?product=${product.Id}">
        <div class="product-card__image-wrapper">
          <img src="${product.Images?.PrimaryMedium}" alt="${product.Name}">
          ${isDiscounted ? `<span class="discount-badge">${discountPercent}% OFF</span>` : ""}
        </div>
        <h3 class="card__brand">${product.Brand.Name}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <p class="product-card__price">
          $${product.FinalPrice}
          ${isDiscounted ? `<span class="original-price">$${product.SuggestedRetailPrice}</span>` : ""}
        </p>
      </a>
    </li>
  `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    try {
      // Show loading indicator
      this.listElement.innerHTML = "<li class='loading'><p>Loading products...</p></li>";
      
      const params = new URLSearchParams(window.location.search);
      const searchTerm = params.get("search");
      let list = [];

      console.log('ProductList init - Category:', this.category, 'Search:', searchTerm);

      if (searchTerm) {
        // If search param is present, search using the API
        document.querySelector(".title").textContent = `Search results for "${searchTerm}"`;
        // For now, we'll search within the category data
        const allData = await this.dataSource.getData(this.category);
        list = this.searchProducts(allData, searchTerm);
      } else {
        // Default category-based product list
        console.log('Loading category:', this.category);
        list = await this.dataSource.getData(this.category);
        const formattedCategory = this.category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        document.querySelector(".title").textContent = formattedCategory;
      }

      console.log('API response:', list ? list.length : 0, 'products');

      if (!list || list.length === 0) {
        console.log('No products found, trying fallback...');
        // Try fallback to local JSON
        try {
          const response = await fetch(`./json/${this.category}.json`);
          if (response.ok) {
            list = await response.json();
            console.log('Fallback JSON loaded:', list.length, 'products');
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }

      this.products = list || [];

      if (!list || list.length === 0) {
        this.listElement.innerHTML = "<li class='no-products'><p>No products found for this category. Please try again later.</p></li>";
      } else {
        this.renderList(list);
      }

      // Setup sorting functionality
      this.setupSortingControls();
    } catch (error) {
      console.error('Error loading products:', error);
      console.error('Category:', this.category);
      console.error('DataSource:', this.dataSource);
      this.listElement.innerHTML = "<li class='error'><p>Unable to load products. The category might not exist or the API is unavailable.</p></li>";
    }
  }

  searchProducts(products, searchTerm) {
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.Name.toLowerCase().includes(term) ||
      product.NameWithoutBrand.toLowerCase().includes(term) ||
      product.Brand.Name.toLowerCase().includes(term)
    );
  }

  setupSortingControls() {
    const sortSelect = document.getElementById("sort");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.displaySortList(e.target.value);
      });
    }
  }

  displaySortList(sortType) {
    let sorted = [...this.products];

    if (sortType === "name") {
      sorted.sort((a, b) => a.Name.localeCompare(b.Name));
    } else if (sortType === "price") {
      sorted.sort((a, b) => a.FinalPrice - b.FinalPrice);
    }
    // "default" keeps original order

    this.renderList(sorted);
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, "afterbegin", true);
  }
}
