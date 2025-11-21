import { loadHeaderFooter, validateEmail, validateCardNumber, validateExpiration, validateCVV, validateZip, showError, clearErrors, alertMessage } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

let checkoutInitialized = false;
// Expose checkout to functions outside DOMContentLoaded (submission handler)
let checkout = null;

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  if (checkoutInitialized) return;
  checkoutInitialized = true;
  
  try {
    await loadHeaderFooter();
    
    checkout = new CheckoutProcess("so-cart", ".checkout-summary");
    checkout.init();
    
    // Set up form validation and submission
    const form = document.forms["checkout"];
    const submitButton = document.querySelector("#checkoutSubmit");
  
    if (form && submitButton) {
      // Add input event listeners for real-time validation
      addInputValidation(form);
      
      // Handle form submission
      form.addEventListener("submit", handleFormSubmit);
    }
  } catch (error) {
    console.error('Error initializing checkout:', error);
  }
});

function addInputValidation(form) {
  // First Name validation
  const fname = form.querySelector("#fname");
  fname.addEventListener("blur", function() {
    validateField(this, this.value.trim() !== "", "First name is required");
  });

  // Last Name validation  
  const lname = form.querySelector("#lname");
  lname.addEventListener("blur", function() {
    validateField(this, this.value.trim() !== "", "Last name is required");
  });

  // Address validation
  const address = form.querySelector("#address");
  address.addEventListener("blur", function() {
    validateField(this, this.value.trim() !== "", "Address is required");
  });

  // City validation
  const city = form.querySelector("#city");
  city.addEventListener("blur", function() {
    validateField(this, this.value.trim() !== "", "City is required");
  });

  // State validation
  const state = form.querySelector("#state");
  state.addEventListener("blur", function() {
    const value = this.value.trim();
    validateField(this, value !== "" && value.length === 2, "State must be 2 characters (e.g., UT)");
  });

  // ZIP validation
  const zip = form.querySelector("#zip");
  zip.addEventListener("blur", function() {
    validateField(this, validateZip(this.value), "ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)");
  });

  // Card Number validation
  const cardNumber = form.querySelector("#cardNumber");
  cardNumber.addEventListener("input", function() {
    // Format card number with spaces
    let value = this.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.value = value;
  });
  
  cardNumber.addEventListener("blur", function() {
    validateField(this, validateCardNumber(this.value), "Card number must be 16 digits");
  });

  // Expiration validation
  const exp = form.querySelector("#exp");
  exp.addEventListener("input", function() {
    // Format expiration with slash
    let value = this.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.value = value;
  });
  
  exp.addEventListener("blur", function() {
    validateField(this, validateExpiration(this.value), "Expiration must be MM/YY format and not expired");
  });

  // CVV validation
  const cvv = form.querySelector("#cvv");
  cvv.addEventListener("input", function() {
    // Only allow numbers and limit to 4 digits
    this.value = this.value.replace(/\D/g, '').substring(0, 4);
  });
  
  cvv.addEventListener("blur", function() {
    validateField(this, validateCVV(this.value), "CVV must be 3-4 digits");
  });
}

function validateField(element, isValid, errorMessage) {
  if (isValid) {
    showError(element, null); // Clear error
    return true;
  } else {
    showError(element, errorMessage);
    return false;
  }
}

function validateForm(form) {
  clearErrors(form);
  
  const fields = [
    { element: form.querySelector("#fname"), validate: (el) => el.value.trim() !== "", message: "First name is required" },
    { element: form.querySelector("#lname"), validate: (el) => el.value.trim() !== "", message: "Last name is required" },
    { element: form.querySelector("#address"), validate: (el) => el.value.trim() !== "", message: "Address is required" },
    { element: form.querySelector("#city"), validate: (el) => el.value.trim() !== "", message: "City is required" },
    { element: form.querySelector("#state"), validate: (el) => el.value.trim().length === 2, message: "State must be 2 characters" },
    { element: form.querySelector("#zip"), validate: (el) => validateZip(el.value), message: "Invalid ZIP code format" },
    { element: form.querySelector("#cardNumber"), validate: (el) => validateCardNumber(el.value), message: "Card number must be 16 digits" },
    { element: form.querySelector("#exp"), validate: (el) => validateExpiration(el.value), message: "Invalid or expired date" },
    { element: form.querySelector("#cvv"), validate: (el) => validateCVV(el.value), message: "CVV must be 3-4 digits" }
  ];
  
  let isValid = true;
  
  fields.forEach(field => {
    if (!field.validate(field.element)) {
      showError(field.element, field.message);
      isValid = false;
    }
  });
  
  return isValid;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = document.querySelector("#checkoutSubmit");
  
  // Clear any previous inline messages
  clearMessage();

  // Use browser HTML5 validation first (since we call preventDefault())
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Validate form with additional checks
  if (!validateForm(form)) {
    alertMessage("Please correct the errors below before submitting.", true, 'error');
    return;
  }
  
  // Check if cart is empty
  if (!checkout.list || checkout.list.length === 0) {
    showMessage("Your cart is empty. Add some items before checking out.", "error");
    return;
  }
  
  // Disable submit button and show loading
  submitButton.disabled = true;
  submitButton.textContent = "Processing...";
  
  try {
    const result = await checkout.checkout(form);
    
    if (result.success) {
      // Navigate to success page after clearing cart (CheckoutProcess already clears it)
      window.location.href = "success.html";
    } else {
      // Show a dismissible alert with server-provided details
      alertMessage(`Order failed: ${result.error}`, true, 'error');
    }
  } catch (error) {
    console.error("Checkout error:", error);
    showMessage("An error occurred while processing your order. Please try again.", "error");
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = "Checkout";
  }
}

function showMessage(message, type = "info") {
  clearMessage();
  
  const messageDiv = document.createElement("div");
  messageDiv.className = `checkout-message checkout-message--${type}`;
  messageDiv.textContent = message;
  
  const form = document.querySelector("form[name='checkout']");
  form.insertBefore(messageDiv, form.firstChild);
  
  // Scroll to top to show message
  messageDiv.scrollIntoView({ behavior: "smooth" });
}

function clearMessage() {
  const existingMessage = document.querySelector(".checkout-message");
  if (existingMessage) {
    existingMessage.remove();
  }
}