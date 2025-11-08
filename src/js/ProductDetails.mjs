import { setLocalStorage } from './utils.mjs';

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
    // save product to localStorage
    setLocalStorage('so-cart', this.product);
    alert(`${this.product.Name} added to cart!`);
  }

  renderProductDetails() {
    // generate HTML for product details
    document.querySelector('.product-detail').innerHTML = `
      <h2>${this.product.Name}</h2>
      <p>${this.product.Description}</p>
      <p>Price: $${this.product.Price}</p>
      <button id="addToCart">Add to Cart</button>
    `;
  }
}

