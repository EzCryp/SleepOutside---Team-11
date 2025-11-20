import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// Get discount information for a product
function getDiscountInfo(product) {
  const finalPrice = product.FinalPrice || product.Price || 0;
  const suggestedPrice = product.SuggestedRetailPrice || product.MSRP || finalPrice;
  
  const isDiscounted = finalPrice < suggestedPrice && suggestedPrice > 0;
  const discountPercent = isDiscounted
    ? Math.round(((suggestedPrice - finalPrice) / suggestedPrice) * 100)
    : 0;
  const discountAmount = isDiscounted
    ? (suggestedPrice - finalPrice).toFixed(2)
    : 0;
  return { isDiscounted, discountPercent, discountAmount, finalPrice, suggestedPrice };
}

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      console.log('Fetching product with ID:', this.productId);
      
      if (!this.productId) {
        throw new Error('No product ID provided');
      }
      
      this.product = await this.dataSource.findProductById(this.productId);
      console.log('Product data received:', this.product);
      
      if (!this.product || !this.product.Id) {
        console.error('Product not found or invalid data:', this.product);
        throw new Error('Product not found');
      }
      
      this.renderProductDetails();
      document
        .getElementById("add-to-cart")
        .addEventListener("click", this.addProductToCart.bind(this));
    } catch (error) {
      console.error('Error in init:', error);
      console.error('Product ID was:', this.productId);
      console.error('DataSource:', this.dataSource);
      this.renderError(error.message);
    }
  }

  addProductToCart() {
    console.log('Adding product to cart:', this.product);
    
    // Get existing cart items as array (not single item)
    let cartItems = getLocalStorage("so-cart");
    
    // Initialize as empty array if null/undefined
    if (!cartItems || !Array.isArray(cartItems)) {
      cartItems = [];
    }
    
    console.log('Current cart items:', cartItems);
    
    // Add the product to the array (don't replace the whole array)
    cartItems.push(this.product);
    
    console.log('Updated cart items:', cartItems);
    
    // Save the array back to localStorage
    setLocalStorage("so-cart", cartItems);
    
    // Update cart count badge
    try {
      import('./CartCount.mjs').then(({ updateCartCount }) => {
        updateCartCount();
      });
    } catch (error) {
      console.log('Could not update cart count:', error);
    }
    
    // Add visual feedback
    const addButton = document.getElementById("add-to-cart");
    if (addButton) {
      const originalText = addButton.textContent;
      addButton.textContent = "✓ Added to Cart!";
      addButton.style.backgroundColor = "#28a745";
      
      setTimeout(() => {
        addButton.textContent = originalText;
        addButton.style.backgroundColor = "";
      }, 2000);
    }
  }
    
    setTimeout(() => {
      addButton.textContent = originalText;
      addButton.style.backgroundColor = "";
    }, 2000);
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }

  renderError(errorMessage = 'Unknown error') {
    document.querySelector("h2").textContent = "Product Not Found";
    document.querySelector("#product-info").innerHTML = `
      <p>Sorry, we couldn't find the product you're looking for.</p>
      <p><strong>Error details:</strong> ${errorMessage}</p>
      <p>Product ID: ${this.productId || 'Not provided'}</p>
      <p><a href="/">Return to homepage</a></p>
      <p><a href="/product_listing/index.html?category=tents">Browse tents</a></p>
    `;
  }
}

function productDetailsTemplate(product) {
  try {
    // Update category title
    document.querySelector("h2").textContent = product.Category ? 
      product.Category.charAt(0).toUpperCase() + product.Category.slice(1) : 
      "Product Details";
    
    // Handle brand - could be object or string
    const brandName = product.Brand && product.Brand.Name ? product.Brand.Name : product.Brand || 'Unknown Brand';
    document.querySelector("#p-brand").textContent = brandName;
    
    // Handle product name
    const productName = product.NameWithoutBrand || product.Name || 'Product Name';
    document.querySelector("#p-name").textContent = productName;

    // Handle images
    const productImage = document.querySelector("#p-image");
    if (product.Images && product.Images.PrimaryLarge) {
      productImage.src = product.Images.PrimaryLarge;
    } else if (product.Images && product.Images.PrimaryMedium) {
      productImage.src = product.Images.PrimaryMedium;
    } else {
      productImage.src = '/images/placeholder.jpg';
    }
    productImage.alt = productName;

    // Update price display with discount information
    const { isDiscounted, discountPercent, discountAmount, finalPrice, suggestedPrice } = getDiscountInfo(product);
    const priceElement = document.querySelector("#p-price");
    
    if (isDiscounted) {
      priceElement.innerHTML = `
        <div class="price-container">
          <div class="price-row">
            <span class="current-price">$${finalPrice.toFixed(2)}</span>
            <span class="original-price">$${suggestedPrice.toFixed(2)}</span>
          </div>
          <div class="discount-info">
            <span class="discount-badge">${discountPercent}% OFF</span>
            <span class="savings-text">You save $${discountAmount}!</span>
          </div>
        </div>
      `;
    } else {
      priceElement.innerHTML = `<span class="current-price">$${finalPrice.toFixed(2)}</span>`;
    }
    
    // Handle colors
    const colorElement = document.querySelector("#p-color");
    if (product.Colors && product.Colors.length > 0) {
      colorElement.textContent = product.Colors[0].ColorName || product.Colors[0];
    } else {
      colorElement.textContent = 'Color information not available';
    }
    
    // Handle description
    const description = product.DescriptionHtmlSimple || product.Description || 'No description available';
    document.querySelector("#p-description").innerHTML = description;
    
    // Set product ID for add to cart
    document.querySelector("#add-to-cart").dataset.id = product.Id || product.id || '';
    
  } catch (error) {
    console.error('Error in productDetailsTemplate:', error);
    document.querySelector("#product-info").innerHTML = '<p>Error displaying product details.</p>';
  }
}
