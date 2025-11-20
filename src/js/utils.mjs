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

let headerFooterLoaded = false;

export async function loadHeaderFooter() {
  if (headerFooterLoaded) return;
  headerFooterLoaded = true;
  
  try {
    const headerTemplate = await loadTemplate("./partials/header.html");
    const footerTemplate = await loadTemplate("./partials/footer.html");

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement && headerTemplate) {
      renderWithTemplate(headerTemplate, headerElement);
    }
    if (footerElement && footerTemplate) {
      renderWithTemplate(footerTemplate, footerElement);
    }
  } catch (error) {
    console.error('Error loading header/footer:', error);
    headerFooterLoaded = false; // Reset on error so we can try again
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