import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';
import { updateCartBadge } from './cartBadge.js';

const dataSource = new ProductData('tents');
const element = document.querySelector('.product-list');
const productList = new ProductList('Tents', dataSource, element);
productList.init();

updateCartBadge();
