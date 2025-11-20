import { loadHeaderFooter, updateCartBadge } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

await loadHeaderFooter();
updateCartBadge();

const dataSource = new ProductData();
const listElement = document.querySelector(".product-list");

// Show top 4 tents on homepage
const listing = new ProductList("tents", dataSource, listElement);
await listing.init(4);
