const baseURL = import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

console.log('Base URL from environment:', baseURL);

if (!import.meta.env.VITE_SERVER_URL) {
  console.warn("⚠️ VITE_SERVER_URL is not defined! Using fallback URL:", baseURL);
  console.error("Environment variables:", import.meta.env);
}

async function convertToJson(res) {
  // Always attempt to parse the response body as JSON first so we
  // can include any server-provided error details in thrown errors.
  let jsonResponse = null;
  try {
    jsonResponse = await res.json();
  } catch (err) {
    // If parsing fails, keep jsonResponse as null
    jsonResponse = null;
  }

  if (res.ok) {
    return jsonResponse;
  }

  // Throw a structured error so callers can inspect details.
  throw { name: 'servicesError', message: jsonResponse || { status: res.status, statusText: res.statusText } };
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
    
    try {
      const response = await fetch(`${baseURL}products/search/${category}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await convertToJson(response);
      console.log('API Response:', data);
      
      if (data.Result && data.Result.length > 0) {
        return data.Result;
      } else {
        console.warn('API returned no results, trying fallback...');
        return await this.getDataFromLocal(category);
      }
    } catch (error) {
      console.error('API request failed:', error);
      console.log('Trying local JSON fallback...');
      return await this.getDataFromLocal(category);
    }
  }

  async getDataFromLocal(category) {
    try {
      const jsonFile = `/json/${category}.json`;
      console.log(`Loading local file: ${jsonFile}`);
      const response = await fetch(jsonFile);
      
      if (!response.ok) {
        throw new Error(`Local file not found: ${response.status}`);
      }
      
      const products = await response.json();
      console.log(`Loaded ${products.length} products from local file`);
      return products;
    } catch (error) {
      console.error('Local file loading failed:', error);
      return [];
    }
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
      const jsonFiles = ['./json/tents.json', './json/backpacks.json', './json/sleeping-bags.json'];
      
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