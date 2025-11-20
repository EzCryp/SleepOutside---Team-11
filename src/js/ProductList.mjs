import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="/product_pages/?product=${product.Id}">
        <img src="${product.Images?.PrimaryMedium}" alt="${product.NameWithoutBrand}">
        <h3>${product.Brand?.Name || ""}</h3>
        <p>${product.NameWithoutBrand}</p>
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

  async init(limit = null) {
    const list = await this.dataSource.getData(this.category);
    const products = limit ? list.slice(0, limit) : list;
    this.renderList(products);

    const titleElement = document.querySelector(".title");
    if (titleElement) {
      const categoryName = this.category
        .replace(/-/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      titleElement.textContent = `Top Products: ${categoryName}`;
    }
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list);
  }
}
