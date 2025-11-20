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
      <a href="/product_pages/index.html?product=${product.Id}">
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
      const params = new URLSearchParams(window.location.search);
      const searchTerm = params.get("search");
      let list = [];

      if (searchTerm) {
        // If search param is present, search using the API
        document.querySelector(".title").textContent = `Search results for "${searchTerm}"`;
        // For now, we'll search within the category data
        const allData = await this.dataSource.getData(this.category);
        list = this.searchProducts(allData, searchTerm);
      } else {
        // Default category-based product list
        list = await this.dataSource.getData(this.category);
        const formattedCategory = this.category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        document.querySelector(".title").textContent = formattedCategory;
      }

      this.products = list;

      if (list.length === 0) {
        this.listElement.innerHTML = "<li class='no-products'><p>No products found.</p></li>";
      } else {
        this.renderList(list);
      }

      // Setup sorting functionality
      this.setupSortingControls();
    } catch (error) {
      console.error('Error loading products:', error);
      this.listElement.innerHTML = "<li class='error'><p>Error loading products. Please try again later.</p></li>";
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
