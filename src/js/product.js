import { getParam, loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

// Prevent duplicate initialization
let productInitialized = false;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  if (productInitialized) return;
  productInitialized = true;
  
  try {
    console.log('Initializing product page...');
    await loadHeaderFooter();

    const dataSource = new ExternalServices();
    const productID = getParam("product");

    if (!productID) {
      console.error('No product ID found in URL');
      document.querySelector("h2").textContent = "Product Not Found";
    } else {
      const product = new ProductDetails(productID, dataSource);
      product.init();
    }
    console.log('Product page initialized successfully');
  } catch (error) {
    console.error('Error during product initialization:', error);
  }
});