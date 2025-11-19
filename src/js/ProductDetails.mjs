import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();
    document
      .getElementById("add-to-cart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    const cartItems = getLocalStorage("so-cart") || [];
    cartItems.push(this.product);
    setLocalStorage("so-cart", cartItems);
    
    // Add visual feedback
    const addButton = document.getElementById("add-to-cart");
    const originalText = addButton.textContent;
    addButton.textContent = "✓ Added to Cart!";
    addButton.style.backgroundColor = "#28a745";
    
    setTimeout(() => {
      addButton.textContent = originalText;
      addButton.style.backgroundColor = "";
    }, 2000);
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }
}

function productDetailsTemplate(product) {
  // Update category title
  document.querySelector("h2").textContent = product.Category ? 
    product.Category.charAt(0).toUpperCase() + product.Category.slice(1) : 
    "Product Details";
  
  document.querySelector("#p-brand").textContent = product.Brand.Name;
  document.querySelector("#p-name").textContent = product.NameWithoutBrand;

  const productImage = document.querySelector("#p-image");
  productImage.src = product.Images.PrimaryLarge;
  productImage.alt = product.NameWithoutBrand;

  // Update price display
  document.querySelector("#p-price").textContent = `$${product.FinalPrice}`;
  
  document.querySelector("#p-color").textContent = product.Colors[0].ColorName;
  document.querySelector("#p-description").innerHTML = product.DescriptionHtmlSimple;
  document.querySelector("#add-to-cart").dataset.id = product.Id;
}
