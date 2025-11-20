import { loadHeaderFooter, getParam } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer first, then initialize the page
  await loadHeaderFooter();
  
  // Get the category from the URL parameter
  const category = getParam("category") || "tents";
  
  // Select the list element (guaranteed to exist after DOM is loaded)
  const listElement = document.querySelector(".product-list");
  
  // Check if list element exists
  if (!listElement) {
    console.error("Product list element not found");
    return;
  }
  
  // Create data source using API services
  const dataSource = new ExternalServices();
  
  // Create and initialize product list
  const productList = new ProductList(category, dataSource, listElement);
  await productList.init();
});
