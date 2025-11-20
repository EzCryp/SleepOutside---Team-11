import { getLocalStorage } from "./utils.mjs";

export function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  const cartCount = document.getElementById("cart-count");

  const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  console.log("Cart count updated:", count);

  if (cartCount) {
    if (count > 0) {
      cartCount.textContent = count;
      cartCount.classList.remove("hide");
    } else {
      cartCount.classList.add("hide");
    }
  }
}

export function initSearchForm() {
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const searchInput = document.getElementById("searchInput");
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `./product_listing/index.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}