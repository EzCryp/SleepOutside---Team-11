import { getLocalStorage, setLocalStorage, updateCartBadge } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
  this.product = await this.dataSource.findProductById(this.productId);

  if (!this.product) {
    document.querySelector("main").innerHTML = "<p>Product not found.</p>";
    return;
  }

  this.renderProductDetails();

  const addBtn = document.getElementById("addToCart");
  if (addBtn) {
    addBtn.addEventListener("click", this.addProductToCart.bind(this));
  }
}


  addProductToCart() {
    let cartItems = getLocalStorage("so-cart") || [];
    const index = cartItems.findIndex(item => String(item.Id) === String(this.product.Id));
    if (index !== -1) {
      cartItems[index].quantity = (cartItems[index].quantity || 1) + 1;
    } else {
      this.product.quantity = 1;
      cartItems.push(this.product);
    }
    setLocalStorage("so-cart", cartItems);
    updateCartBadge();
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }
}

function productDetailsTemplate(product) {
  document.querySelector("#productBrand").textContent = product.Brand?.Name || "Unknown Brand";
  document.querySelector("#productName").textContent = product.NameWithoutBrand || "Unnamed Product";

  const productImage = document.getElementById("productImage");
  productImage.src = product.Images?.PrimaryLarge; // API field
  productImage.alt = product.NameWithoutBrand;

  const price = product.FinalPrice || product.ListPrice || product.SuggestedRetailPrice || 0;
  document.querySelector("#productPrice").textContent = `$${price}`;

  document.querySelector("#productColor").textContent = product.Colors?.[0]?.ColorName || "N/A";
  document.querySelector("#productDesc").innerHTML = product.DescriptionHtmlSimple || "No description available";

  document.querySelector("#addToCart").dataset.id = product.Id;
}
