import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeaderFooter();
  renderCartContents();
});

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  
  if (cartItems.length === 0) {
    document.querySelector(".product-list").innerHTML = "<li>Your cart is empty</li>";
    document.querySelector(".list-footer").classList.add("hide");
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
  
  // Calculate and display total (considering quantities)
  const total = cartItems.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = item.FinalPrice || 0;
    return sum + (price * quantity);
  }, 0);
  document.querySelector(".list-total").textContent = `$${total.toFixed(2)}`;
  document.querySelector(".list-footer").classList.remove("hide");
  
  // Add event listeners to remove buttons
  addRemoveListeners();
}

function removeItemFromCart(productId) {
  let cartItems = getLocalStorage("so-cart") || [];
  
  // Remove the first occurrence of the item with matching ID
  const itemIndex = cartItems.findIndex(item => item.Id === productId);
  if (itemIndex > -1) {
    cartItems.splice(itemIndex, 1);
    setLocalStorage("so-cart", cartItems);
    // Re-render the cart to show updated content
    renderCartContents();
  }
}

function addRemoveListeners() {
  const removeButtons = document.querySelectorAll(".cart-card__remove");
  removeButtons.forEach(button => {
    button.addEventListener("click", function(event) {
      event.preventDefault();
      const productId = this.dataset.id;
      removeItemFromCart(productId);
    });
  });
}

function cartItemTemplate(item) {
  const quantity = item.quantity || 1;
  const itemTotal = (item.FinalPrice * quantity).toFixed(2);
  
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Images.PrimaryMedium}"
      alt="${item.Name}"
    />
  </a>
  <a href="../product_pages/index.html?product=${item.Id}">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: ${quantity}</p>
  <p class="cart-card__price">$${itemTotal}</p>
  <button class="cart-card__remove" data-id="${item.Id}">✕ Remove</button>
</li>`;

  return newItem;
}
