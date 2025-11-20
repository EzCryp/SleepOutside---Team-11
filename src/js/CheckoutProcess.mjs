import ExternalServices from "./ExternalServices.mjs";
import { formDataToJSON, getLocalStorage, setLocalStorage } from "./utils.mjs";

const services = new ExternalServices(); 

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key);
    this.calculateItemSubTotal();
    this.calculateOrderTotal();
    this.displayOrderTotals();
  }

  calculateItemSubTotal() {
    this.itemTotal = 0;
    let totalItems = 0;

    if (this.list && this.list.length > 0) {
      this.list.forEach(item => {
        const quantity = item.quantity || 1;
        this.itemTotal += item.FinalPrice * quantity;
        totalItems += quantity;
      });
    }

    // Update UI
    const subtotalElem = document.querySelector(`${this.outputSelector} #cartTotal`);
    const itemCountElem = document.querySelector(`${this.outputSelector} #numberItems`);

    if (subtotalElem) subtotalElem.textContent = `$${this.itemTotal.toFixed(2)}`;
    if (itemCountElem) itemCountElem.textContent = totalItems;
  }

  calculateOrderTotal() {
    // Tax: 6% of item total
    this.tax = this.itemTotal * 0.06;

    // Shipping: $10 for first item, $2 each additional
    const totalItems = this.list ? this.list.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    this.shipping = totalItems > 0 ? 10 + (totalItems - 1) * 2 : 0;

    // Total
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const tax = document.querySelector(`${this.outputSelector} #tax`);
    const shipping = document.querySelector(`${this.outputSelector} #shipping`);
    const total = document.querySelector(`${this.outputSelector} #total`);

    if (tax) tax.textContent = `$${this.tax.toFixed(2)}`;
    if (shipping) shipping.textContent = `$${this.shipping.toFixed(2)}`;
    if (total) total.textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  packageItems(items) {
    if (!items || items.length === 0) return [];
    
    return items.map(item => ({
      id: item.Id || item.id,
      name: item.Name || item.name,
      price: item.FinalPrice || item.price,
      quantity: item.quantity || 1
    }));
  }

  async checkout(form) {
    try {
      console.log("Checkout process started");
      
      // Convert form data to JSON
      const order = formDataToJSON(form);
      console.log("Order from form:", order);

      // Add additional order details
      order.orderDate = new Date().toISOString();
      order.orderTotal = this.orderTotal;
      order.tax = this.tax;
      order.shipping = this.shipping;
      order.items = this.packageItems(this.list);
      
      console.log("Final order data:", order);

      // Submit to API
      const response = await services.checkout(order);
      console.log("Order submitted successfully:", response);

      // Clear the cart after successful order
      setLocalStorage(this.key, []);
      
      return { success: true, order: response };
      
    } catch (error) {
      console.error("Checkout error:", error);
      return { success: false, error: error.message };
    }
  }
}