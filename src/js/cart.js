import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

// Prevent duplicate initialization
let cartInitialized = false;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  if (cartInitialized) return;
  cartInitialized = true;
  
  try {
    console.log('Initializing cart page...');
    await loadHeaderFooter();
    renderCartContents();
    console.log('Cart page initialized successfully');
  } catch (error) {
    console.error('Error during cart initialization:', error);
  }
});

function renderCartContents() {
  let cartItems = getLocalStorage("so-cart");
  
  // Ensure we have an array
  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }
  
  console.log('Rendering cart with items:', cartItems);
  
  if (cartItems.length === 0) {
    productList.innerHTML = "<li>Your cart is empty</li>";
    if (totalElement) {
      totalElement.textContent = "Total: $0.00"; //reset total when empty
    }
    updateCartBadge();
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
  
  // Calculate and display total (simple sum of FinalPrice for each item)
  const total = cartItems.reduce((sum, item) => {
    const price = item.FinalPrice || 0;
    return sum + price;
  }, 0);
  document.querySelector(".list-total").textContent = `$${total.toFixed(2)}`;
  document.querySelector(".list-footer").classList.remove("hide");
  // Wire checkout button (navigate to checkout form)
  const checkoutBtn = document.querySelector('#goToCheckout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Navigate to the checkout page
      window.location.href = "../checkout/";
    });
  }
  
  // Add event listeners to remove buttons
  addRemoveListeners();
}

async function removeItemFromCart(productId) {
  let cartItems = getLocalStorage("so-cart") || [];
  
  // Remove the first occurrence of the item with matching ID
  const itemIndex = cartItems.findIndex(item => item.Id === productId);
  if (itemIndex > -1) {
    cartItems.splice(itemIndex, 1);
    setLocalStorage("so-cart", cartItems);
    
    // Update cart count badge
    try {
      const { updateCartCount } = await import('./CartCount.mjs');
      updateCartCount();
    } catch (error) {
      console.log('Could not update cart count:', error);
    }
    
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
  // Simple template without quantity for W01 basic functionality
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Images?.PrimaryMedium || ''}"
      alt="${item.Name || ''}"
    />
  </a>
  <a href="../product_pages/index.html?product=${item.Id}">
    <h2 class="card__name">${item.Name || ''}</h2>
  </a>
  <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ''}</p>
  <p class="cart-card__price">$${item.FinalPrice || 0}</p>
  <button class="cart-card__remove" data-id="${item.Id}">✕ Remove</button>
</li>`;

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
