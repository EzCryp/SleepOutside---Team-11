import { getLocalStorage } from './utils.mjs';

export function updateCartBadge() {
  const cartItems = getLocalStorage('so-cart') || [];
  const badge = document.querySelector('.cart-count');

  if (badge) {
    const totalQty = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.textContent = totalQty;
  }
}

