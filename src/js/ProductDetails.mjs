import { setLocalStorage, getLocalStorage } from './utils.mjs';
import { updateCartBadge } from './cartBadge.js';

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // get product details
    this.product = await this.dataSource.findProductById(this.productId);

    // render product details
    this.renderProductDetails();

    // add event listener for cart button
    document.getElementById('addToCart')
      .addEventListener('click', this.addProductToCart.bind(this));
  }

  addProductToCart() {
  // get current cart or empty array
  let cart = getLocalStorage('so-cart') || [];

  // check if product already exists in cart
  const existingItemIndex = cart.findIndex(item => item.Id === this.product.Id);

  if (existingItemIndex > -1) {
    // if found, increment a quantity property
    if (!cart[existingItemIndex].quantity) {
      cart[existingItemIndex].quantity = 1;
    }
    cart[existingItemIndex].quantity += 1;
  } else {
    // if not found, add product with quantity = 1
    const productWithQty = { ...this.product, quantity: 1 };
    cart.push(productWithQty);
  }

  // save back to localStorage
  setLocalStorage('so-cart', cart);

  // update badge immediately
  updateCartBadge();

  alert(`${this.product.Name} added to cart!`);
}


  renderProductDetails() {
  const colors = this.product.Colors
    ? this.product.Colors.map(c => c.ColorName).join(', ')
    : '';

  document.querySelector('.product-detail').innerHTML = `
    <h3>${this.product.Brand?.Name || ''}</h3>

    <h2 class="divider">${this.product.NameWithoutBrand}</h2>

    <img
      class="divider"
      src="${this.product.Image}"
      alt="${this.product.Name}"
    />

    <p class="product-card__price">$${this.product.FinalPrice}</p>

    <p class="product__color"><strong>Color: </strong>${colors}</p>

    <p class="product__description">
      ${this.product.DescriptionHtmlSimple}
    </p>

    <div class="product-detail__add">
      <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
    </div>
  `;
}

}
