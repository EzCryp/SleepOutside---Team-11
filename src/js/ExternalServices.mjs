const baseURL = import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

console.log('Base URL from environment:', baseURL);

if (!import.meta.env.VITE_SERVER_URL) {
  console.warn("⚠️ VITE_SERVER_URL is not defined! Using fallback URL:", baseURL);
  console.error("Environment variables:", import.meta.env);
}

async function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ExternalServices {
  constructor() {
    // this.category = category;
    // this.path = `../public/json/${this.category}.json`;
  }
  async getData(category = null) {
    if (!category) {
      throw new Error('Category is required');
    }
    
    console.log(`Fetching data for category: ${category}`);
    console.log(`API URL: ${baseURL}products/search/${category}`);
    
    const response = await fetch(`${baseURL}products/search/${category}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await convertToJson(response);
    console.log('API Response:', data);
    
    return data.Result || [];
  }
  async findProductById(id) {
    try {
      console.log(`🔍 Looking for product with ID: ${id}`);
      console.log(`Making API call to: ${baseURL}product/${id}`);
      const response = await fetch(`${baseURL}product/${id}`);
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await convertToJson(response);
        console.log('✅ API Response data:', data);
        if (data.Result) {
          return data.Result;
        }
      }
      
      console.warn(`⚠️ API request failed: ${response.status} ${response.statusText}. Trying fallback...`);
      // Try fallback to local JSON if API fails
      return await this.findProductByIdLocal(id);
      
    } catch (error) {
      console.error('❌ Error in findProductById:', error);
      console.log('🔄 Trying local fallback...');
      try {
        return await this.findProductByIdLocal(id);
      } catch (fallbackError) {
        console.error('❌ Local fallback also failed:', fallbackError);
        throw new Error(`Both API and local data failed: ${error.message}`);
      }
    }
  }

  async findProductByIdLocal(id) {
    try {
      // Try different JSON files since we have multiple categories
      const jsonFiles = ['./public/json/tents.json', './public/json/backpacks.json', './public/json/sleeping-bags.json'];
      
      console.log(`Looking for product ${id} in local JSON files...`);
      
      for (const jsonFile of jsonFiles) {
        try {
          console.log(`Trying to load: ${jsonFile}`);
          const response = await fetch(jsonFile);
          console.log(`Response for ${jsonFile}:`, response.status, response.ok);
          
          if (response.ok) {
            const products = await response.json();
            console.log(`Found ${products.length} products in ${jsonFile}`);
            const product = products.find(p => p.Id === id || p.id === id);
            if (product) {
              console.log(`✅ Found product ${id} in ${jsonFile}:`, product);
              return product;
            } else {
              console.log(`❌ Product ${id} not found in ${jsonFile}`);
            }
          }
        } catch (fileError) {
          console.error(`❌ Could not load ${jsonFile}:`, fileError.message);
          continue;
        }
      }
      
      throw new Error(`Product with ID ${id} not found in any local JSON files`);
    } catch (error) {
      console.error('Error in findProductByIdLocal:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    const response = await fetch(`${baseURL}products/search/${query}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(order) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    };
    
    try {
      console.log('Submitting order to API:', order);
      const response = await fetch(`${baseURL}checkout`, options);
      
      if (!response.ok) {
        throw new Error(`Checkout failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await convertToJson(response);
      console.log('Order submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }

}