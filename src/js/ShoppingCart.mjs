import { getLocalStorage, setLocalStorage, updateCartBadge } from "./utils.mjs";

export default class ShoppingCart {
  constructor(listSelector) {
    this.listElement = document.querySelector(listSelector);
    this.items = getLocalStorage("so-cart") || [];
  }

  get total() {
    return this.items.reduce(
      (sum, item) => sum + (item.FinalPrice || item.ListPrice || 0) * (item.quantity || 1),
      0
    );
  }

  template(item) {
    return `
      <li class="cart-card divider">
        <span class="remove-item" data-id="${item.Id}">✖</span>
        <a href="/product_pages/index.html?product=${item.Id}" class="cart-card__image">
          <img src="${item.Image}" alt="${item.NameWithoutBrand}" />
        </a>
        <a href="/product_pages/index.html?product=${item.Id}">
          <h2 class="card__name">${item.Name}</h2>
        </a>
        <p class="cart-card__color">${item.Colors?.[0]?.ColorName || "N/A"}</p>
        <div class="cart-card__quantity">
          <button class="decrement" data-id="${item.Id}">–</button>
          <span>qty: ${item.quantity || 1}</span>
          <button class="increment" data-id="${item.Id}">+</button>
        </div>
        <p class="cart-card__price">$${item.FinalPrice || item.ListPrice || item.SuggestedRetailPrice}</p>
      </li>
    `;
  }

  render() {
    this.items = getLocalStorage("so-cart") || [];

    if (!this.items.length) {
      this.listElement.innerHTML = "<li>Your cart is empty</li>";
      updateCartBadge();
      return;
    }

    this.listElement.innerHTML = this.items.map((item) => this.template(item)).join("");

    const totalElement = document.querySelector(".list-total");
    if (totalElement) totalElement.textContent = `$${this.total.toFixed(2)}`;

    updateCartBadge();
    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", () => this.removeItem(btn.dataset.id));
    });

    document.querySelectorAll(".increment").forEach((btn) => {
      btn.addEventListener("click", () => this.changeQuantity(btn.dataset.id, 1));
    });

    document.querySelectorAll(".decrement").forEach((btn) => {
      btn.addEventListener("click", () => this.changeQuantity(btn.dataset.id, -1));
    });
  }

  removeItem(id) {
    this.items = this.items.filter((item) => String(item.Id) !== String(id));
    setLocalStorage("so-cart", this.items);
    this.render();
  }

  changeQuantity(id, delta) {
    const index = this.items.findIndex((item) => String(item.Id) === String(id));
    if (index !== -1) {
      this.items[index].quantity = (this.items[index].quantity || 1) + delta;
      if (this.items[index].quantity <= 0) this.items.splice(index, 1);
      setLocalStorage("so-cart", this.items);
      this.render();
    }
  }
}
