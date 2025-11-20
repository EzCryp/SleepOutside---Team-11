import {
  loadHeaderFooter,
  updateCartBadge,
  getLocalStorage,
  setLocalStorage,
} from "./utils.mjs";

await loadHeaderFooter();
updateCartBadge();

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  const totalElement = document.querySelector(".list-total");

  if (cartItems.length === 0) {
    productList.innerHTML = "<li>Your cart is empty</li>";
    if (totalElement) {
      totalElement.textContent = "Total: $0.00"; //reset total when empty
    }
    updateCartBadge();
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  productList.innerHTML = htmlItems.join("");

  const total = cartItems.reduce(
    (sum, item) =>
      sum + (item.FinalPrice || item.ListPrice || 0) * (item.quantity || 1),
    0,
  );

  if (totalElement) {
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
  }

  updateCartBadge();
  attachCartListeners();
}

function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <span class="remove-item" data-id="${item.Id}">✖</span>
      <a href="/product_pages/index.html?product=${item.Id}" class="cart-card__image">
        <img src="${item.Images?.PrimarySmall || item.Images?.PrimaryMedium}" 
        alt="${item.NameWithoutBrand}">
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

function attachCartListeners() {
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });

  document.querySelectorAll(".increment").forEach((btn) => {
    btn.addEventListener("click", () => changeQuantity(btn.dataset.id, 1));
  });

  document.querySelectorAll(".decrement").forEach((btn) => {
    btn.addEventListener("click", () => changeQuantity(btn.dataset.id, -1));
  });
}

function removeFromCart(id) {
  let cartItems = getLocalStorage("so-cart") || [];
  cartItems = cartItems.filter((item) => String(item.Id) !== String(id));
  setLocalStorage("so-cart", cartItems);

  renderCartContents();
  updateCartBadge();
}

function changeQuantity(id, delta) {
  let cartItems = getLocalStorage("so-cart") || [];
  const index = cartItems.findIndex((item) => String(item.Id) === String(id));

  if (index !== -1) {
    cartItems[index].quantity = (cartItems[index].quantity || 1) + delta;
    if (cartItems[index].quantity <= 0) cartItems.splice(index, 1);
    setLocalStorage("so-cart", cartItems);
  }

  renderCartContents();
  updateCartBadge();
}

renderCartContents();
