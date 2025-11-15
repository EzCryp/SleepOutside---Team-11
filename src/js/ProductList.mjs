import { renderListWithTemplate } from './utils.mjs';

function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="product_pages/?product=${product.Id}">
        <img src="${product.Image}" alt="${product.Name}">
        <h2>${product.Brand.Name}</h2>
        <h3>${product.Name}</h3>
        <p class="product-card__price">$${product.FinalPrice}</p>
      </a>
    </li>
    `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
  const list = await this.dataSource.getData();

  // Only keep products with these IDs
  const allowedIds = ['880RR', '985RF', '985PR', '344YJ'];
  const filteredList = list.filter(item => allowedIds.includes(item.Id));

  this.renderList(filteredList);
}


  renderList(list) {

    renderListWithTemplate(productCardTemplate, this.listElement, list);

  }

}
