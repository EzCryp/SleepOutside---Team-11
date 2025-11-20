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
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    // console.log(data.Result);
    return data.Result;
  }

  async searchProducts(query) {
    const response = await fetch(`${baseURL}products/search/${query}`);
    const data = await convertToJson(response);
    return data.Result;
  }

}