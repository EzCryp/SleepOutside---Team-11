import { loadHeaderFooter, getParam } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";

let listingInitialized = false;

document.addEventListener("DOMContentLoaded", async () => {
  if (listingInitialized) return;
  listingInitialized = true;
  
  try {
    // Clear any existing content first to prevent duplication
    const mainElement = document.querySelector("main");
    if (mainElement) {
      // Only keep the products section, remove any other content
      const productsSection = mainElement.querySelector(".products");
      if (productsSection) {
        mainElement.innerHTML = "";
        mainElement.appendChild(productsSection);
      }
    }
    
    // Load header and footer first, then initialize the page
    await loadHeaderFooter();
    
    // Get the category and search query from URL parameters
    const category = getParam("category") || "tents";
    const searchQuery = getParam("search");
    
    // Select the list element (guaranteed to exist after DOM is loaded)
    const listElement = document.querySelector(".product-list");
    
    // Check if list element exists
    if (!listElement) {
      console.error("Product list element not found");
      return;
    }
    
    // Create data source using API services
    const dataSource = new ExternalServices();
    
    // Create and initialize product list with search query if provided
    const productList = new ProductList(category, dataSource, listElement);
    await productList.init(searchQuery);
    
    // Update page title if searching
    if (searchQuery) {
      const titleElement = document.querySelector("h2");
      if (titleElement) {
        titleElement.textContent = `Search Results for "${searchQuery}"`;
      }
    }
    
  } catch (error) {
    console.error('Error initializing product listing:', error);
  }
});
