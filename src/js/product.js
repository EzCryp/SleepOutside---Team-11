import { getParam, loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

loadHeaderFooter();

const dataSource = new ExternalServices();
const productID = getParam("product");

if (!productID) {
  console.error('No product ID found in URL');
  document.querySelector("h2").textContent = "Product Not Found";
} else {
  const product = new ProductDetails(productID, dataSource);
  product.init();
}