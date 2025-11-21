// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// get the product id from the query string
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get(param);
  return product
}

export function renderListWithTemplate(template, parentElement, list, position = "afterbegin", clear = false) {
  const htmlStrings = list.map(template);
  // if clear is true we need to clear out the contents of the parent.
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

// Global flag to prevent duplicate header/footer loading
if (typeof window !== 'undefined') {
  window.headerFooterLoadingState = window.headerFooterLoadingState || 'unloaded';
}

export async function loadHeaderFooter() {
  if (typeof window !== 'undefined' && window.headerFooterLoadingState !== 'unloaded') {
    console.log('Header/footer already loaded or loading, skipping...');
    return;
  }
  
  if (typeof window !== 'undefined') {
    window.headerFooterLoadingState = 'loading';
  }
  
  try {
    // Defensive: remove any duplicate top-level sections that preview tooling
    // or injected scripts may have produced before we try to load templates.
    if (typeof document !== 'undefined' && typeof removeDuplicateElements === 'function') {
      removeDuplicateElements(['main', 'header#main-header', 'footer#main-footer', '.hero', '.categories', '.products']);
    }
    await loadHeaderFooterInternal();
    if (typeof window !== 'undefined') {
      window.headerFooterLoadingState = 'loaded';
    }
  } catch (error) {
    if (typeof window !== 'undefined') {
      window.headerFooterLoadingState = 'unloaded'; // Reset on error
    }
    throw error;
  }
}

async function loadHeaderFooterInternal() {
  try {
    console.log('Loading header and footer...');
    
    // Determine correct paths based on current location
    const isInSubfolder = window.location.pathname.includes('/product_listing/') || 
                         window.location.pathname.includes('/cart/') || 
                         window.location.pathname.includes('/checkout/') ||
                         window.location.pathname.includes('/product_pages/');
    
    const headerPath = isInSubfolder ? "../partials/header.html" : "./partials/header.html";
    const footerPath = isInSubfolder ? "../partials/footer.html" : "./partials/footer.html";
    
    const headerTemplate = await loadTemplate(headerPath);
    const footerTemplate = await loadTemplate(footerPath);

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement && headerTemplate) {
      if (headerElement.innerHTML.trim() === '') {
        renderWithTemplate(headerTemplate, headerElement);
        
        // Initialize cart count and search functionality after header loads
        const { updateCartCount, initSearchForm } = await import('./CartCount.mjs');
        updateCartCount();
        initSearchForm();
      }
    }
    if (footerElement && footerTemplate) {
      if (footerElement.innerHTML.trim() === '') {
        renderWithTemplate(footerTemplate, footerElement);
      }
    }
    
    console.log('Header and footer loaded successfully');
  } catch (error) {
    console.error('Error loading header/footer:', error);
    // Don't set headerFooterLoaded = true on error, so we can retry
  }
}

export function formDataToJSON(formElement) {
  const formData = new FormData(formElement),
    convertedJSON = {};

  formData.forEach(function (value, key) {
    convertedJSON[key] = value;
  });

  return convertedJSON;
}

// Validation functions
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCardNumber(cardNumber) {
  // Remove spaces and check if it's 16 digits
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
}

export function validateExpiration(exp) {
  // Format: MM/YY or MM/YYYY
  const expRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
  if (!expRegex.test(exp)) return false;
  
  const [month, year] = exp.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = year.length === 2 ? parseInt('20' + year) : parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear > currentYear) return true;
  if (expYear === currentYear && expMonth >= currentMonth) return true;
  
  return false;
}

export function validateCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

export function validateZip(zip) {
  // US zip code format: 5 digits or 5+4 format
  return /^\d{5}(-\d{4})?$/.test(zip);
}

export function showError(element, message) {
  // Remove existing error styling
  element.classList.remove('error');
  
  // Find existing error message
  const existingError = element.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  if (message) {
    // Add error styling
    element.classList.add('error');
    
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    element.parentNode.appendChild(errorDiv);
  }
}

export function clearErrors(form) {
  const errorElements = form.querySelectorAll('.error');
  const errorMessages = form.querySelectorAll('.error-message');
  
  errorElements.forEach(el => el.classList.remove('error'));
  errorMessages.forEach(el => el.remove());
}

// General alert message insertion at top of main element
export function alertMessage(message, scroll = true, type = 'error') {
  // Remove any existing alert
  const existing = document.querySelector('.site-alert');
  if (existing) existing.remove();

  const main = document.querySelector('main') || document.body;
  const alert = document.createElement('div');
  alert.className = `site-alert site-alert--${type}`;
  alert.innerHTML = `<div class="site-alert__inner">${message}<button class="site-alert__close" aria-label="dismiss">×</button></div>`;

  main.insertAdjacentElement('afterbegin', alert);

  const closeBtn = alert.querySelector('.site-alert__close');
  closeBtn.addEventListener('click', () => alert.remove());

  if (scroll) {
    alert.scrollIntoView({ behavior: 'smooth' });
  }
  return alert;
}

// Remove duplicate elements for given selectors, keeping the first occurrence only.
export function removeDuplicateElements(selectors = []) {
  if (typeof document === 'undefined') return;
  try {
    selectors.forEach(selector => {
      const nodes = Array.from(document.querySelectorAll(selector));
      if (nodes.length > 1) {
        console.warn(`removeDuplicateElements: found ${nodes.length} '${selector}' elements — removing duplicates.`);
        // Keep the first occurrence, remove the rest
        nodes.slice(1).forEach(n => n.remove());
      }
    });
  } catch (err) {
    console.error('removeDuplicateElements error:', err);
  }
}