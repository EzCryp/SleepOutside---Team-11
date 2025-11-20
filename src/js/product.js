import { loadHeaderFooter, updateCartBadge } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

await loadHeaderFooter();
updateCartBadge();

const productID = new URLSearchParams(window.location.search).get("product");
const dataSource = new ProductData();
const product = new ProductDetails(productID, dataSource);
await product.init();
