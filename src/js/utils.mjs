// LocalStorage helpers
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Badge shows total items including repeats
export function updateCartBadge() {
  const cartItems = getLocalStorage("so-cart") || [];
  const badge = document.querySelector("#cart-count");
  if (badge) {
    const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.textContent = totalCount;
  }
}

// Load an HTML partial
export async function loadTemplate(path) {
  const res = await fetch(path);
  return res.text();
}

// Render a single template
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

// ✅ NEW: Render a list with a template function
export function renderListWithTemplate(templateFn, parentElement, list) {
  parentElement.innerHTML = list.map(item => templateFn(item)).join("");
}

// Load header and footer partials
export async function loadHeaderFooter() {
  // use absolute paths so they work from any page
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");

  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  renderWithTemplate(headerTemplate, headerElement, null, () => {
    updateCartBadge(); // ensure badge updates after header loads
  });

  renderWithTemplate(footerTemplate, footerElement);
}

// ✅ Helper: get URL parameter
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}
