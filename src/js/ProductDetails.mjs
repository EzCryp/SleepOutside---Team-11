import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      this.product = await this.dataSource.findProductById(this.productId);
      if (!this.product) {
        throw new Error('Product not found');
      }
      this.renderProductDetails();
      document
        .getElementById("add-to-cart")
        .addEventListener("click", this.addProductToCart.bind(this));
    } catch (error) {
      console.error('Error loading product:', error);
      this.renderError();
    }
  }

  addProductToCart() {
    const cartItems = getLocalStorage("so-cart") || [];
    cartItems.push(this.product);
    setLocalStorage("so-cart", cartItems);
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }

  renderError() {
    document.querySelector(".product-detail").innerHTML = `
      <h2>Product Not Found</h2>
      <p>Sorry, the product you're looking for could not be found.</p>
      <a href="/product_listing/index.html?category=tents">Browse All Products</a>
    `;
  }
}

function productDetailsTemplate(product) {
  // Update page title
  document.title = `Sleep Outside | ${product.Name || 'Product Details'}`;
  
  // Update category title
  document.querySelector("h2").textContent = product.Category ? 
    product.Category.charAt(0).toUpperCase() + product.Category.slice(1) : 
    "Product Details";
  
  document.querySelector("#p-brand").textContent = product.Brand?.Name || '';
  document.querySelector("#p-name").textContent = product.NameWithoutBrand || product.Name || '';

  const productImage = document.querySelector("#p-image");
  productImage.src = product.Images?.PrimaryLarge || product.Images?.PrimaryMedium || '';
  productImage.alt = product.NameWithoutBrand || product.Name || 'Product Image';

  // Update price display
  document.querySelector("#p-price").textContent = `$${product.FinalPrice || '0.00'}`;
  
  document.querySelector("#p-color").textContent = product.Colors?.[0]?.ColorName || 'Not specified';
  document.querySelector("#p-description").innerHTML = product.DescriptionHtmlSimple || 'No description available';
  document.querySelector("#add-to-cart").dataset.id = product.Id || '';
}
