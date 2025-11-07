import { setLocalStorage, getLocalStorage } from './utils.mjs';

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // Get product details from data source
    this.product = await this.dataSource.findProductById(this.productId);
    
    // Render the product on the page
    this.renderProductDetails();
    
    // Add click event to Add to Cart button
    document.getElementById('addToCart')
      .addEventListener('click', this.addToCart.bind(this));
  }

  addToCart() {
    let cart = getLocalStorage('so-cart') || [];
    cart.push(this.product);
    setLocalStorage('so-cart', cart);
  }

  renderProductDetails() {
    // Create HTML for product details
    const productHTML = `
      <section class="product-detail">
        <h2>${this.product.Brand.Name}</h2>
        <h3>${this.product.NameWithoutBrand}</h3>
        <img src="${this.product.Image}" alt="${this.product.NameWithoutBrand}">
        <p class="product-card__price">$${this.product.FinalPrice}</p>
        <p class="product__color">${this.product.Colors[0].ColorName}</p>
        <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
        <div class="product-detail__add">
          <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
        </div>
      </section>
    `;
    
    // Insert into page
    document.querySelector('main').innerHTML = productHTML;
    
    // Update page title
    document.title = `${this.product.Brand.Name} ${this.product.NameWithoutBrand} - Sleep Outside`;
  }
}
