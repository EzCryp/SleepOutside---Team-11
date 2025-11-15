import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';

// Create an instance of ProductData for the 'tents' category
const dataSource = new ProductData('tents');

// Get the HTML element where products will be displayed
const listElement = document.querySelector('.product-list');

// Create an instance of ProductList
const myProductList = new ProductList('tents', dataSource, listElement);

// Initialize and render the product list
myProductList.init();
