import { loadHeaderFooter, getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

await loadHeaderFooter();

// Read category from query string
const category = getParam("category") || "tents";

// Create data source
const dataSource = new ProductData();

// Select the list element
const listElement = document.querySelector(".product-list");

// Create ProductList instance
const listing = new ProductList(category, dataSource, listElement);
await listing.init();
